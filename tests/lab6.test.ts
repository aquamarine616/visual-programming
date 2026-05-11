import { describe, expectTypeOf, it } from 'vitest';
import type { DeepReadonly, EventHandlers, PickedByType } from '../src/lab6';

describe('lab6 type tests', () => {
  it('DeepReadonly<T>', () => {
    type Source = {
      id: number;
      name: string;
      nested: {
        active: boolean;
        meta: {
          created: string;
        };
      };
      items: { value: number }[];
      tuple: [{ count: number }, string];
      callback: (value: number) => string;
    };

    type Result = DeepReadonly<Source>;

    expectTypeOf<Result>().toEqualTypeOf<{
      readonly id: number;
      readonly name: string;
      readonly nested: {
        readonly active: boolean;
        readonly meta: {
          readonly created: string;
        };
      };
      readonly items: readonly {
        readonly value: number;
      }[];
      readonly tuple: readonly [{
        readonly count: number;
      }, string];
      readonly callback: (value: number) => string;
    }>();
  });

  it('PickedByType<T, U>', () => {
    type Source = {
      id: number;
      title: string;
      isOpen: boolean;
      count: number;
      description: string;
    };

    type StringsOnly = PickedByType<Source, string>;
    type NumbersOnly = PickedByType<Source, number>;

    expectTypeOf<StringsOnly>().toEqualTypeOf<{
      title: string;
      description: string;
    }>();

    expectTypeOf<NumbersOnly>().toEqualTypeOf<{
      id: number;
      count: number;
    }>();
  });

  it('EventHandlers<T>', () => {
    type Events = {
      click: { x: number; y: number };
      change: string;
      submit: { formId: string };
    };

    type Result = EventHandlers<Events>;

    expectTypeOf<Result>().toEqualTypeOf<{
      onClick: (event: { x: number; y: number }) => void;
      onChange: (event: string) => void;
      onSubmit: (event: { formId: string }) => void;
    }>();
  });
});