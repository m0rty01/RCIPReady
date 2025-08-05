import { OpenAI } from 'openai';
import { prisma } from '../lib/prisma';
import { ProcessStage } from '@prisma/client';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  dueDate?: Date;
  dependsOn?: string[];
  documentType?: string;
}

interface Timeline {
  currentStage: ProcessStage;
  stages: {
    stage: ProcessStage;
    completed: boolean;
    startDate?: Date;
    endDate?: Date;
    checklist: ChecklistItem[];
  }[];
}

export class ProcessTracker {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  static async createTimeline(
    userId: string,
    communityId: string,
    initialStage: ProcessStage = ProcessStage.JOB_SEARCH
  ): Promise<Timeline> {
    // Create or update application process
    const process = await prisma.applicationProcess.upsert({
      where: {
        userId_communityId: {
          userId,
          communityId,
        },
      },
      create: {
        userId,
        communityId,
        stage: initialStage,
      },
      update: {
        stage: initialStage,
      },
    });

    // Generate checklist for each stage
    const timeline = await this.generateTimeline(process);
    
    return timeline;
  }

  static async updateStage(
    userId: string,
    communityId: string,
    newStage: ProcessStage
  ): Promise<Timeline> {
    const process = await prisma.applicationProcess.update({
      where: {
        userId_communityId: {
          userId,
          communityId,
        },
      },
      data: {
        stage: newStage,
        updatedAt: new Date(),
      },
    });

    return this.generateTimeline(process);
  }

  static async updateChecklistItem(
    userId: string,
    communityId: string,
    itemId: string,
    completed: boolean
  ): Promise<Timeline> {
    // Update checklist item status in the database
    await prisma.checklistItem.update({
      where: {
        id: itemId,
        process: {
          userId,
          communityId,
        },
      },
      data: {
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    const process = await prisma.applicationProcess.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId,
        },
      },
    });

    if (!process) {
      throw new Error('Process not found');
    }

    return this.generateTimeline(process);
  }

  private static async generateTimeline(
    process: any
  ): Promise<Timeline> {
    const stages = [
      ProcessStage.JOB_SEARCH,
      ProcessStage.JOB_OFFER,
      ProcessStage.EMPLOYER_APPLICATION,
      ProcessStage.COMMUNITY_ENDORSEMENT,
      ProcessStage.PR_APPLICATION,
      ProcessStage.WORK_PERMIT,
      ProcessStage.COMPLETED,
    ];

    const community = await prisma.community.findUnique({
      where: { id: process.communityId },
    });

    if (!community) {
      throw new Error('Community not found');
    }

    const timeline: Timeline = {
      currentStage: process.stage,
      stages: [],
    };

    for (const stage of stages) {
      const checklist = await this.generateChecklist(stage, community.name);
      const stageData = {
        stage,
        completed: this.isStageCompleted(stage, process.stage),
        startDate: this.getStageStartDate(stage, process),
        endDate: this.getStageEndDate(stage, process),
        checklist,
      };
      timeline.stages.push(stageData);
    }

    return timeline;
  }

  private static async generateChecklist(
    stage: ProcessStage,
    communityName: string
  ): Promise<ChecklistItem[]> {
    const prompt = `
      Generate a detailed checklist for the ${stage} stage of the RCIP process in ${communityName}.
      Include all required documents, forms, and steps.
      Format as JSON array of checklist items with:
      - id: unique string
      - title: short description
      - description: detailed explanation
      - required: boolean
      - documentType: string (if applicable)
      - dependsOn: array of prerequisite item IDs
    `;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert RCIP immigration consultant creating a detailed process checklist.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const checklist = JSON.parse(completion.choices[0].message.content || '[]');
    return checklist.map((item: any) => ({ ...item, completed: false }));
  }

  private static isStageCompleted(stage: ProcessStage, currentStage: ProcessStage): boolean {
    const stageOrder = [
      ProcessStage.JOB_SEARCH,
      ProcessStage.JOB_OFFER,
      ProcessStage.EMPLOYER_APPLICATION,
      ProcessStage.COMMUNITY_ENDORSEMENT,
      ProcessStage.PR_APPLICATION,
      ProcessStage.WORK_PERMIT,
      ProcessStage.COMPLETED,
    ];

    return stageOrder.indexOf(stage) < stageOrder.indexOf(currentStage);
  }

  private static getStageStartDate(stage: ProcessStage, process: any): Date | undefined {
    // Implementation depends on how you track stage transitions
    // This is a simplified version
    if (stage === process.stage) {
      return process.updatedAt;
    }
    return undefined;
  }

  private static getStageEndDate(stage: ProcessStage, process: any): Date | undefined {
    // Implementation depends on how you track stage transitions
    // This is a simplified version
    if (this.isStageCompleted(stage, process.stage)) {
      return process.updatedAt;
    }
    return undefined;
  }
}