import { Injectable } from "@nestjs/common";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { ICrudRepository } from "../../../shared/interfaces/ICrudRepository";
import { currentLocalTimeStamp } from "../../../shared/utils/helpers/current-local-timestamp";
import { pkGenerator } from "../../../shared/utils/helpers/primary-key-utils";
import { DrizzleQueryBuilderSyntax } from "../../data-layer/drizzle.decorator";
import { CreateStuff, ReadStuff, StuffEntity } from "../../data-layer/drizzle/types";
import { CreateStuffDto } from "./dto/create-stuff.dto";
import { UpdateStuffDto } from "./dto/update-stuff.dto";
import { InjectStuffEntity } from "./stuff.decorator";

@Injectable()
export class StuffCrudRepository
  implements ICrudRepository<StuffEntity, ReadStuff, CreateStuffDto, UpdateStuffDto>
{
  constructor(
    @DrizzleQueryBuilderSyntax() private readonly db: PostgresJsDatabase,
    @InjectStuffEntity() readonly entity: StuffEntity
  ) {}

  async create(dto: CreateStuffDto): Promise<ReadStuff | null> {
    dto.Password = await bcrypt.hash(dto.Password, 8);

    const insertStuffData: CreateStuff = {
      Id: pkGenerator(),
      CreatedAt: currentLocalTimeStamp(),
      Role: "Moderator",
      ...dto
    };

    const [data] = await this.db.insert(this.entity).values(insertStuffData).returning();
    return data?.Id ? data : null;
  }

  async findOneById(id: string): Promise<ReadStuff | null> {
    const [data] = await this.db.select().from(this.entity).where(eq(this.entity.Id, id));
    return data?.Id ? data : null;
  }

  async findOneByUniqueIdentifier(uniqueIdentifier: string): Promise<ReadStuff | null> {
    const [data] = await this.db
      .select()
      .from(this.entity)
      .where(eq(this.entity.Email, uniqueIdentifier));
    return data?.Id ? data : null;
  }

  async update(id: string, dto: UpdateStuffDto): Promise<ReadStuff | null> {
    const [data] = await this.db
      .update(this.entity)
      .set({ ...dto, UpdatedAt: currentLocalTimeStamp() })
      .where(eq(this.entity.Id, id))
      .returning();
    return data?.Id ? data : null;
  }

  async deleteById(id: string): Promise<boolean> {
    const [data] = await this.db
      .delete(this.entity)
      .where(eq(this.entity.Id, id))
      .returning({ Id: this.entity.Id });

    return data?.Id ? true : false;
  }
}
