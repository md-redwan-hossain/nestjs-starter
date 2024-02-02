// An expmple of TReadEntity param is:  typeof users.$inferSelect;

export interface IRepository<TEntity, TKey, TReadEntity, TCreateDto, TUpdateDto> {
  readonly entity: TEntity;
  create(dto: TCreateDto): Promise<TReadEntity | null>;
  findOne(uniqueIdentifier: TKey): Promise<TReadEntity | null>;
  findAll(uniqueIdentifier: TKey): Promise<TReadEntity | null>;
  update(uniqueIdentifier: TKey, dto: TUpdateDto): Promise<TReadEntity | null>;
  delete(uniqueIdentifier: TKey): Promise<boolean>;
}
