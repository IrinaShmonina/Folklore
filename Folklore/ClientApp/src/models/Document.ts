import { Tag } from "./Tag";
import { MotivationalThematicClassification } from "./MotivationalThematicClassification";
import { Genre } from "./Genre";
import { Informant } from "./Informant";
import { Folklorist } from "./Folklorist";

export default interface FolkDocument {
    id: number;
    title?: string;
    content?: string;
    placeName?: string;
    placeLatitude?: number;
    placeLongitude?: number;
    yearOfRecord?: number;
    additionalInformation?: string;
    fileName?: string;
    deleted: boolean;
    createdAt: Date;
    folklorists: Folklorist[];
    informants: Informant[];
    genres: Genre[];
    motivationalThematicClassifications: MotivationalThematicClassification[];
    tags: Tag[];
}
