export interface IExtendedFieldDefinition<
  TBaseType extends string,
  TOptions extends object | undefined = undefined,
  TData = never
> extends IFieldDefinition<TBaseType, TOptions> {
  data?: TData;
}

export interface IFieldDefinition<
  TBaseType extends string,
  TOptions extends object | undefined
> {
  base: TBaseType;
  /**
   * Note definition `options` are not field props. The definition `options`
   * are for defining a base field to a concrete field; while field props are
   * for instantiating a field that will be rendered.
   */
  options?: TOptions;
}
