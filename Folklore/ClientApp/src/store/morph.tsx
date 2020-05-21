export interface MorphInfo {
    initialForm: string;
    partOfSpeach: string;
    grammaticalSigns: string;
}

export function parseMorphCsv(csv: string): MorphInfo[] {
    const lines = csv.split(/\r|\n/g);
    return lines.filter(line => !(/^\s+$/.test(line))).map(line => {
        const parts = line.split(";").map(part => part.trim());
        let morphInfo = {
            initialForm: '',
            partOfSpeach: '',
            grammaticalSigns: ''
        }

        parts.length > 1 && (morphInfo.initialForm = parts[1])
        parts.length > 2 && (morphInfo.partOfSpeach = parts[2])
        parts.length > 3 && (morphInfo.grammaticalSigns = parts[3])

        return morphInfo;
    })
}