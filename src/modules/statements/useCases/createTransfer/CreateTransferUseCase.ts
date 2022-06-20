import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "../createStatement/CreateStatementError";
import ICreateTransferDTO from "./ICreateTransferDTO";

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}
  async execute({ amount, description, type, user_id, sender_id }: ICreateTransferDTO): Promise<Statement> {
    const user = await this.usersRepository.findById(user_id);
    const senderUser = await this.usersRepository.findById(sender_id);

    if (!user || !senderUser) {
      throw new CreateStatementError.UserNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id: sender_id
    });

    if (balance < amount) {
      throw new CreateStatementError.InsufficientFunds()
    }

    const transfer = await this.statementsRepository.createTransfer({
      amount,
      description,
      sender_id,
      type,
      user_id
    })

    return transfer;
  }
}

export { CreateTransferUseCase }
