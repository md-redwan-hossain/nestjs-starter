// An expmple of TEntitySelect param is:  InferSelectModel<typeof users>;
// InferSelectModel is a drizzle specific feature
// import { InferSelectModel } from "drizzle-orm";

export interface IRepository<TEntity, TKey, TEntitySelect, TCreateDto, TUpdateDto> {
  readonly entity: TEntity;
  create(dto: TCreateDto): Promise<TEntitySelect | null>;
  findOne(uniqueIdentifier: TKey): Promise<TEntitySelect | null>;
  findAll(uniqueIdentifier: TKey): Promise<TEntitySelect | null>;
  update(uniqueIdentifier: TKey, dto: TUpdateDto): Promise<TEntitySelect | null>;
  delete(uniqueIdentifier: TKey): Promise<boolean>;
}
