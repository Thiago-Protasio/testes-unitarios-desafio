import { Request, Response } from "express";
import { container } from "tsyringe";
import { OperationType } from "../../entities/Statement";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

class CreateTransferController {
  async execute(request: Request, response: Response): Promise<Response> {
    const { id: sender_id } = request.user;
    const { amount, description } = request.body;
    const { user_id } = request.params;

    const type = OperationType.TRANSFER;

    const createTransferUseCase = container.resolve(CreateTransferUseCase);

    const transferOperation = await createTransferUseCase.execute({
      amount,
      description,
      type,
      user_id,
      sender_id,
    })

    return response.status(201).json(transferOperation);
  }
}

export { CreateTransferController }
