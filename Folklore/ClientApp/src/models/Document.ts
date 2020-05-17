import { Tag } from "./Tag";
import { MotivationalThematicClassification } from "./MotivationalThematicClassification";
import { Genre } from "./Genre";
import { Informant } from "./Informant";
import { Folklorist } from "./Folklorist";

export default interface FolkDocument {
    id?: number;
    title: string;
    content?: string;
    placeName?: string;
    placeLatitude?: number;
    placeLongitude?: number;
    yearOfRecord?: number;
    additionalInformation?: string;
    fileName?: string;
    fileId?: string;
    deleted: boolean;
    createdAt: Date;
    folklorists: Folklorist[];
    informants: Informant[];
    genres: Genre[];
    motivationalThematicClassifications: MotivationalThematicClassification[];
    tags: Tag[];
}

export function createEmptyDoc(): FolkDocument {
    return {
        title: '',
        content: '',
        placeName: '',
        additionalInformation: '',
        fileName: '',
        fileId: '',
        deleted: false,
        createdAt: new Date(),
        folklorists: [],
        informants: [],
        genres: [],
        motivationalThematicClassifications: [],
        tags: []
    }
}