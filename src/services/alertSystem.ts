import { OpenAI } from 'openai';
import { prisma } from '../lib/prisma';
import { ProcessStage } from '@prisma/client';

interface Alert {
  id: string;
  userId: string;
  type: 'deadline' | 'action' | 'update' | 'warning';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
  actionRequired?: string;
  isRead: boolean;
  createdAt: Date;
}

export class AlertSystem {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  static async checkAndGenerateAlerts(userId: string): Promise<Alert[]> {
    try {
      const process = await prisma.applicationProcess.findFirst({
        where: { userId },
        include: {
          community: true,
          documents: true,
        },
        orderBy: { updatedAt: 'desc' },
      });

      if (!process) {
        return [];
      }

      const alerts: Alert[] = [];

      // Check document expiry
      const documentAlerts = await this.checkDocumentExpiry(process.documents);
      alerts.push(...documentAlerts);

      // Check stage deadlines
      const deadlineAlerts = await this.checkStageDeadlines(process);
      alerts.push(...deadlineAlerts);

      // Generate next steps
      const nextStepAlerts = await this.generateNextSteps(process);
      alerts.push(...nextStepAlerts);

      // Save alerts to database
      await this.saveAlerts(alerts);

      return alerts;
    } catch (error) {
      console.error('Error generating alerts:', error);
      throw new Error('Failed to generate alerts');
    }
  }

  private static async checkDocumentExpiry(documents: any[]): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    for (const doc of documents) {
      if (doc.validUntil) {
        const validUntil = new Date(doc.validUntil);
        if (validUntil < thirtyDaysFromNow) {
          alerts.push({
            id: `doc-expiry-${doc.id}`,
            userId: doc.userId,
            type: 'warning',
            title: 'Document Expiring Soon',
            message: `Your ${doc.type} will expire on ${validUntil.toLocaleDateString()}. Please ensure to renew it before expiry.`,
            priority: validUntil < now ? 'high' : 'medium',
            dueDate: validUntil,
            actionRequired: `Renew ${doc.type}`,
            isRead: false,
            createdAt: new Date(),
          });
        }
      }
    }

    return alerts;
  }

  private static async checkStageDeadlines(process: any): Promise<Alert[]> {
    const alerts: Alert[] = [];
    const stageDeadlines = {
      JOB_OFFER: 30, // days to accept job offer
      EMPLOYER_APPLICATION: 60, // days to complete employer application
      COMMUNITY_ENDORSEMENT: 90, // days for community to make decision
      PR_APPLICATION: 60, // days to submit PR after endorsement
    };

    if (process.stage in stageDeadlines) {
      const deadline = new Date(process.updatedAt);
      deadline.setDate(deadline.getDate() + stageDeadlines[process.stage as keyof typeof stageDeadlines]);

      if (deadline > new Date()) {
        alerts.push({
          id: `stage-deadline-${process.id}`,
          userId: process.userId,
          type: 'deadline',
          title: `${process.stage} Deadline Approaching`,
          message: `You have until ${deadline.toLocaleDateString()} to complete your ${process.stage.toLowerCase().replace('_', ' ')}.`,
          priority: 'high',
          dueDate: deadline,
          actionRequired: `Complete ${process.stage.toLowerCase().replace('_', ' ')}`,
          isRead: false,
          createdAt: new Date(),
        });
      }
    }

    return alerts;
  }

  private static async generateNextSteps(process: any): Promise<Alert[]> {
    const prompt = `
      Generate next steps for RCIP applicant at stage: ${process.stage}
      
      Current Process:
      ${JSON.stringify(process, null, 2)}
      
      Return a JSON array of alerts with:
      {
        "type": "action",
        "title": "clear action title",
        "message": "detailed explanation",
        "priority": "high/medium/low",
        "actionRequired": "specific action needed"
      }
    `;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert RCIP immigration consultant.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const nextSteps = JSON.parse(completion.choices[0].message.content || '[]');
    return nextSteps.map((step: any) => ({
      ...step,
      id: `next-step-${process.id}-${Math.random().toString(36).substr(2, 9)}`,
      userId: process.userId,
      isRead: false,
      createdAt: new Date(),
    }));
  }

  private static async saveAlerts(alerts: Alert[]): Promise<void> {
    for (const alert of alerts) {
      await prisma.alert.create({
        data: {
          id: alert.id,
          userId: alert.userId,
          type: alert.type,
          title: alert.title,
          message: alert.message,
          priority: alert.priority,
          dueDate: alert.dueDate,
          actionRequired: alert.actionRequired,
          isRead: alert.isRead,
          createdAt: alert.createdAt,
        },
      });
    }
  }

  static async markAlertAsRead(alertId: string): Promise<void> {
    await prisma.alert.update({
      where: { id: alertId },
      data: { isRead: true },
    });
  }

  static async getUnreadAlerts(userId: string): Promise<Alert[]> {
    return await prisma.alert.findMany({
      where: {
        userId,
        isRead: false,
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }
}