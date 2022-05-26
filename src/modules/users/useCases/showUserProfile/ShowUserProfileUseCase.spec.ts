import e from "express";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Show user profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to to return the user profile", async () => {
    const createdUser: ICreateUserDTO = {
      email: "test@test.com",
      name: "test name",
      password: "123456"
    };

    await createUserUseCase.execute(createdUser);

    const authenticatedUser = await authenticateUserUseCase.execute({
      email: createdUser.email,
      password: createdUser.password
    });

    const user_id: string = authenticatedUser.user.id!;

    const userProfile = await showUserProfileUseCase.execute(user_id);

    expect(userProfile).toHaveProperty("id")
  });

  it("Should not be able to return the profile if the user doesn't exist", () => {
    expect(async () => {
      const user_id = "invalid_id"

      await showUserProfileUseCase.execute(user_id);
    }).rejects.toBeInstanceOf(AppError);
  });
});
