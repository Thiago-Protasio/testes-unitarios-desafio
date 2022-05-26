import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Create statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("Should be able to create a new deposit", async () => {
    const user: ICreateUserDTO = {
      email: "test@test.com",
      name: "test name",
      password: "123456"
    }

    await createUserUseCase.execute(user);

    const authenticatedUser = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    const user_id = authenticatedUser.user.id!;

    const type = OperationType.DEPOSIT

    const statementOperation = await createStatementUseCase.execute({
      user_id,
      type,
      amount: 100,
      description: "Test statement"
    });

    expect(statementOperation).toHaveProperty("id");
  });

  it("Should be able to create a new withdraw", async () => {
    const user: ICreateUserDTO = {
      email: "test@test.com",
      name: "test name",
      password: "123456"
    }

    await createUserUseCase.execute(user);

    const authenticatedUser = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    const user_id = authenticatedUser.user.id!;

    await createStatementUseCase.execute({
      user_id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Test deposit statement"
    });

    const statementWithdraw = await createStatementUseCase.execute({
      user_id,
      type: OperationType.WITHDRAW,
      amount: 50,
      description: "Test withdraw statement"
    });

    expect(statementWithdraw).toHaveProperty("id");
  });

  it("Should not be able to withdraw if the funds are insufficient", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        email: "test@test.com",
        name: "test name",
        password: "123456"
      }

      await createUserUseCase.execute(user);

      const authenticatedUser = await authenticateUserUseCase.execute({
        email: user.email,
        password: user.password
      });

      const user_id = authenticatedUser.user.id!;

      await createStatementUseCase.execute({
        user_id,
        type: OperationType.WITHDRAW,
        amount: 100,
        description: "Test withdraw statement"
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("Should not be able to make a statement if the user does not exist", async () => {
    expect(async () => {
      const user_id = "invalid_id";

      await createStatementUseCase.execute({
        user_id,
        type: OperationType.WITHDRAW,
        amount: 100,
        description: "Test withdraw statement"
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
