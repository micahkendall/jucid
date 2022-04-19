import { PlutusData, C } from '../index.js';
import { fromHex } from './utils.js';

export class Construct {
  index: number;
  args: Data[];

  constructor(index: number, args: PlutusData[]) {
    this.index = index;
    this.args = args;
  }
}

export class Data extends C.PlutusData {
  static fromJS(data: PlutusData) {
    try {
      if (typeof data === 'bigint') {
        return this.new_integer(C.BigInt.from_str(data.toString()));
      } else if (typeof data === 'string') {
        return this.new_bytes(fromHex(data));
      } else if (data instanceof Construct) {
        const { index, args } = data;
        const plutusList = C.PlutusList.new();

        args.forEach((arg) => plutusList.add(Data.fromJS(arg)));

        return this.new_constr_plutus_data(
          C.ConstrPlutusData.new(
            C.BigNum.from_str(index.toString()),
            plutusList,
          ),
        );
      } else if (Array.isArray(data)) {
        const plutusList = C.PlutusList.new();

        data.forEach((arg) => plutusList.add(Data.fromJS(arg)));

        return this.new_list(plutusList);
      } else if (typeof data === 'object') {
        const plutusMap = C.PlutusMap.new();

        Object.entries(data).forEach(([key, value]) => {
          plutusMap.insert(
            C.PlutusData.new_bytes(fromHex(key)),
            Data.fromJS(value),
          );
        });

        return this.new_map(plutusMap);
      }
      throw new Error('Unsupported type');
    } catch (error) {
      throw new Error('Could not serialize the data: ' + error);
    }
  }
}
