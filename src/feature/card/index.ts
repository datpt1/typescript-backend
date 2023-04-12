import { Controller, Get, Post, Put, Delete, Route, Body, Path, Tags, Response } from 'tsoa';
import {CardModel} from '../../models/card.model';
import { ICardInput, ICardOutput } from './schema';
import { Request, Response as ExpressResponse, NextFunction } from 'express';
import mongoose from 'mongoose';
import {JsonResponse} from "../../utils/response";
import logger from "../../utils/logger";

@Route('/cards')
@Tags('Cards')
export class CardController extends Controller {
  @Get('/')
  static async getAllCards(req: Request, res: ExpressResponse, next: NextFunction) {
    try {
      const cards = await CardModel.find();
      res.status(200).json(cards); // send the cards data as a JSON response
    } catch (error) {
      // handle any errors that occur during the query
      logger.error(`Error getting cards: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }

  @Post('/')
  public async createCard(@Body() card: ICardInput): Promise<ICardOutput> {
    const newCard = new CardModel(card);
    await newCard.save();
    return newCard.toObject();
  }

  @Get('/:id')
  public async getCardById(@Path() id: string): Promise<ICardOutput> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      this.setStatus(400);
      throw new Error('Invalid card ID');
    }
    const card = await CardModel.findById(id);
    if (!card) {
      this.setStatus(404);
      throw new Error('Card not found');
    }
    return card.toObject();
  }

  @Put('/:id')
  public async updateCard(@Path() id: string, @Body() card: ICardInput): Promise<ICardOutput> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      this.setStatus(400);
      throw new Error('Invalid card ID');
    }
    const updatedCard = await CardModel.findByIdAndUpdate(id, card, { new: true });
    if (!updatedCard) {
      this.setStatus(404);
      throw new Error('Card not found');
    }
    return updatedCard.toObject();
  }

  @Delete('/:id')
  public async deleteCard(@Path() id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      this.setStatus(400);
      throw new Error('Invalid card ID');
    }
    const result = await CardModel.findByIdAndDelete(id);
    if (!result) {
      this.setStatus(404);
      throw new Error('Card not found');
    }
  }

  @Response(500, 'Internal server error')
  public errorHandler(err: any, req: Request, res: ExpressResponse, next: NextFunction): void {
    this.setStatus(500);
    res.json({
      message: err.message,
    });
  }
}
