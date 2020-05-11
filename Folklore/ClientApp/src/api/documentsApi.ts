import FolkDocument from "../models/Document";

export default class DocumentApi {
    static async getAllDocuments(): Promise<FolkDocument[]> {
        const response = await fetch('api/document/all');
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
        })

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

        var json = await (response.json() as Promise<{id: string}>);

        return json.id;
    }
}