import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  });

  it("Should be able to authenticate an user", async () => {
    const user: ICreateUserDTO = {
      email: "test@test.com",
      name: "test name",
      password: "123456"
    };

    await createUserUseCase.execute(user);

    const authenticatedUser = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    expect(authenticatedUser).toHaveProperty("token");
    expect(authenticatedUser).toHaveProperty("user");
  });

  it("Should not be able to authenticate if the user doesn't exist", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "teste@test.com",
        password: "123456789"
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("Should not be able to log in while the password is incorrect", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        email: "test@test.com",
        name: "test name",
        password: "123456"
      };

      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({
        email: user.email,
        password: "Incorrect password"
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
