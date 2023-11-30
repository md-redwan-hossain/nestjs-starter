export interface ICrudRepository<TEntity, TEntitySelect, TCreateDto, TUpdateDto> {
  readonly entity: TEntity;
  create(dto: TCreateDto): Promise<TEntitySelect | null>;
  findOneById(id: string): Promise<TEntitySelect | null>;
  findOneByUniqueIdentifier(uniqueIdentifier: string): Promise<TEntitySelect | null>;
  update(id: string, dto: TUpdateDto): Promise<TEntitySelect | null>;
  deleteById(id: string): Promise<boolean>;
}
