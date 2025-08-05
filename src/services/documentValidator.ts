import { OpenAI } from 'openai';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Document } from '@prisma/client';
import { prisma } from '../lib/prisma';
import * as pdfParse from 'pdf-parse';

// Rest of the file remains the same...