import { ExtractSubjectType as E } from '@casl/ability';
import {
  AbilityTuple,
  AnyAbility,
  Generics,
  Normalize,
  ProduceGeneric,
  RawRuleOf,
  SubjectType,
} from '@casl/ability';
import {
  AnyClass,
  AnyObject,
  TaggedInterface,
} from '@casl/ability/dist/types/types';

declare class RuleBuilder<T extends AnyAbility> {
  _rule: RawRuleOf<T>;
  constructor(rule: RawRuleOf<T>);
  because(reason: string): this;
}
type InstanceOf<T extends AnyAbility, S extends SubjectType> =
  S extends AnyClass<infer R>
    ? R
    : S extends (...args: any[]) => infer O
      ? O
      : S extends string
        ? Exclude<
            Normalize<Generics<T>['abilities']>[1],
            SubjectType
          > extends TaggedInterface<string>
          ? Extract<Normalize<Generics<T>['abilities']>[1], TaggedInterface<S>>
          : AnyObject
        : never;
type ConditionsOf<T extends AnyAbility, I extends {}> = ProduceGeneric<
  Generics<T>['conditions'],
  I
>;
type ActionFrom<T extends AbilityTuple, S extends SubjectType> = T extends any
  ? S extends Extract<T[1], SubjectType>
    ? T[0]
    : never
  : never;
type ActionOf<T extends AnyAbility, S extends SubjectType> = ActionFrom<
  Generics<T>['abilities'],
  S
>;
type SubjectTypeOf<T extends AnyAbility> = E<
  Normalize<Generics<T>['abilities']>[1]
>;
type SimpleCanParams<T extends AnyAbility> = Parameters<
  (action: Generics<T>['abilities'] | Generics<T>['abilities'][]) => 0
>;
type BuilderCanParameters<
  S extends SubjectType,
  I extends InstanceOf<T, S>,
  T extends AnyAbility,
> = Generics<T>['abilities'] extends AbilityTuple
  ? Parameters<
      (
        action: ActionOf<T, S> | ActionOf<T, S>[],
        subject: S | S[],
        conditions?: ConditionsOf<T, I>,
      ) => 0
    >
  : SimpleCanParams<T>;
type BuilderCanParametersWithFields<
  S extends SubjectType,
  I extends InstanceOf<T, S>,
  F extends string,
  T extends AnyAbility,
> = Generics<T>['abilities'] extends AbilityTuple
  ? Parameters<
      (
        action: ActionOf<T, S> | ActionOf<T, S>[],
        subject: S | S[],
        fields?: F | F[],
        conditions?: ConditionsOf<T, I>,
      ) => 0
    >
  : SimpleCanParams<T>;
type Keys<T> = string & keyof T;

export type AddRule<T extends AnyAbility> = {
  <
    I extends InstanceOf<T, S>,
    F extends string = Keys<I>,
    S extends SubjectTypeOf<T> = SubjectTypeOf<T>,
  >(
    ...args: BuilderCanParametersWithFields<S, I, F | Keys<I>, T>
  ): RuleBuilder<T>;
  <I extends InstanceOf<T, S>, S extends SubjectTypeOf<T> = SubjectTypeOf<T>>(
    ...args: BuilderCanParameters<S, I, T>
  ): RuleBuilder<T>;
};
