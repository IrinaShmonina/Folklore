import FolkDocument from "../models/Document";
import { Genre } from "../models/Genre";
import { Informant } from "../models/Informant";
import { Folklorist } from "../models/Folklorist";
import { MotivationalThematicClassification } from "../models/MotivationalThematicClassification";
import { Tag } from "../models/Tag";

export default class DocumentApi {
  static async getAllDocuments(): Promise<FolkDocument[]> {
    const response = await fetch('api/document/all');
    return await (response.json() as Promise<FolkDocument[]>);
  }

  static async searchDocuments(param: string, genre: string, place: string,yearOfRecord:string,informant:string): Promise<FolkDocument[]> {
    const response = await fetch(`api/document/search?param=${param}&genre=${genre}&place=${place}&yearOfRecord=${yearOfRecord}&informant=${informant}`);
    return await (response.json() as Promise<FolkDocument[]>);
  }

  static async getDocument(id: number): Promise<FolkDocument> {
    const response = await fetch(`api/document?id=${id}`);
    return await (response.json() as Promise<FolkDocument>);
  }

  static async updateDocument(changedDocument: FolkDocument): Promise<FolkDocument> {
    const response = await fetch('api/document', {
      method: "PATCH",
      body: JSON.stringify(changedDocument),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    });

    return await (response.json() as Promise<FolkDocument>);
  }

  static async addDocument(doc: FolkDocument): Promise<FolkDocument> {
    const response = await fetch('api/document', {
      method: "POST",
      body: JSON.stringify(doc),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    });

    return await (response.json() as Promise<FolkDocument>);
  }

  static makeDocumentFileDownloadLink(id: string): string {
    return `api/file?id=${id}`;
  }

  static async uploadFile(file: File): Promise<string> {
    const response = await fetch(`api/file?name=${file.name}`, {
      method: "POST",
      body: file
    });

    var json = await (response.json() as Promise<{ id: string; }>);

    return json.id;
  }
  static async getAllGenres(): Promise<Genre[]> {
    const response = await fetch('api/genre');
    return await (response.json() as Promise<Genre[]>);
  }
  static async searchGenres(genre: string): Promise<Genre[]> {
    const response = await fetch(`api/genre/search?genre=${genre}`);
    return await (response.json() as Promise<Genre[]>);
  }
  static async searchInformants(informant: string): Promise<Informant[]> {
    const response = await fetch(`api/informant/search?informant=${informant}`);
    return await (response.json() as Promise<Informant[]>);
  }
  static async searchFolklorist(folklorist: string): Promise<Folklorist[]> {
    const response = await fetch(`api/folklorist/search?folklorist=${folklorist}`);
    return await (response.json() as Promise<Folklorist[]>);
  }
  static async searchMTCs(mtc: string): Promise<MotivationalThematicClassification[]> {
    const response = await fetch(`api/mtc/search?mtc=${mtc}`);
    return await (response.json() as Promise<MotivationalThematicClassification[]>);
  }
  static async searchTags(tag: string): Promise<Tag[]> {
    const response = await fetch(`api/tag/search?tag=${tag}`);
    return await (response.json() as Promise<Tag[]>);
  }
}