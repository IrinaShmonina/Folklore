import * as Papa from 'papaparse';
import { delimiter } from 'path';

const DELIMITER = ';';

function getCsvColumns(): (keyof MorphInfo)[] {
  return [
    "word",
    "initialForm",
    "partOfSpeach",
    "grammaticalSigns"
  ];
}

function makeMorph(line: string[]): MorphInfo {
  const columns = getCsvColumns();

  let morph: MorphInfo = {
    word: '',
    initialForm: '',
    partOfSpeach: '',
    grammaticalSigns: ''
  };
  line.forEach((value, i) => morph[columns[i]] = value);

  return morph;
}

function isString(x: any): x is string {
  return typeof x === "string";
}

export interface MorphInfo {
  word: string;
  initialForm: string;
  partOfSpeach: string;
  grammaticalSigns: string;
}

export function parseMorphCsv(csv: string): MorphInfo[] {
  const morphs: MorphInfo[] = [];
  const config: Papa.ParseConfig = {
    delimiter: DELIMITER
  };
  Papa.parse(csv, config).data.forEach((line: string[]) => {
    if (!Array.isArray(line)) {
      return;
    }
    if (!line.every(isString)) {
      return;
    }

    const morph = makeMorph(line);
    morphs.push(morph);
  });

  return morphs;
}

export function serializeMorphCsv(morphs: MorphInfo[]): string {
  return Papa.unparse(morphs, {
    delimiter: DELIMITER,
    header: false,
    columns: getCsvColumns()
  });
}