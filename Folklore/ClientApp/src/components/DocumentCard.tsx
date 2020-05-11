import * as React from 'react';
import DocumentApi from '../api/documentsApi';
import FolkDocument from '../models/Document';
import { Col, Button, Input, Badge } from 'reactstrap';
import { Informant } from '../models/Informant';
import { InputRow } from '../components/InputRow';
import { DocInput } from '../components/DocInput';

export interface DocumentCardProps {
  doc: FolkDocument;
  editing: boolean;
  onDocSave: (doc: FolkDocument) => Promise<void>;
}

export interface DocumentCardState {
  doc: FolkDocument;
  editing: boolean;
  newInformant: Informant;
}

export default class DocumentCard extends React.Component<DocumentCardProps, DocumentCardState> {
  constructor(props: DocumentCardProps, state: DocumentCardState) {
    super(props, state);
    this.state = {
      doc: props.doc,
      editing: props.editing,
      newInformant: {
        fio: '',
        yearOfBirth: 0
      }
    };
  }

  startEditing() {
    this.setState({ editing: true });
  }

  async saveChanges() {
    const { doc } = this.state;
    this.setState({ editing: false });
    await this.props.onDocSave(doc);
  }

  changeDocument(partialDocument: Partial<FolkDocument>) {
    let { doc } = this.state;

    this.setState({
      doc: {
        ...doc,
        ...partialDocument
      }
    });
  }

  changeNewInformant(partialInformant: Partial<Informant>) {
    let { newInformant } = this.state;

    this.setState({
      newInformant: {
        ...newInformant,
        ...partialInformant
      }
    });
  }

  pushNewInformant() {
    let { newInformant, doc } = this.state;

    this.changeDocument({
      informants: [
        ...doc.informants,
        newInformant
      ]
    });
    this.setState({ newInformant: {
      fio: '',
      yearOfBirth: 0
    }});
  }

  deleteInformant(deleteIndex: number) {
    let { doc } = this.state;

    this.changeDocument({
      informants: doc.informants.filter((_, i) => i != deleteIndex)
    });
  }

  renderInformant() {
    const { doc, editing, newInformant } = this.state;

    const informantComponents = doc.informants.map((informant, i) => (
      <InputRow key={i}>
        <Col sm={8}>
          <Input readOnly={true} type="text" value={informant.fio} />
        </Col>
        <Col>
          <Input readOnly={true} type="number" value={informant.yearOfBirth} />
        </Col>
        {editing
          ? <Col>
            <Button outline onClick={() => this.deleteInformant(i)} color="danger" style={{ width: "100%" }}>Удалить</Button>
          </Col>
          : null}
      </InputRow>
    ));

    const editingComponent = (
      <InputRow>
        <Col sm={8}>
          <Input type="text" placeholder="ФИО" value={newInformant.fio} onChange={e => this.changeNewInformant({ fio: e.target.value })} />
        </Col>
        <Col sm={2}>
          <Input type="number" placeholder="Год" value={newInformant.yearOfBirth} onChange={e => this.changeNewInformant({ yearOfBirth: parseInt(e.target.value, 10) })} />
        </Col>
        <Col sm={2}>
          <Button outline color="primary" style={{ width: "100%" }} onClick={() => this.pushNewInformant()}>Добавить</Button>
        </Col>
      </InputRow>
    );

    return (
      <React.Fragment>
        {informantComponents}
        {editing ? editingComponent : null}
      </React.Fragment>
    );
  }

  renderTags() {
    const { doc, editing } = this.state;

    let tags = doc.tags.map((tag, i) =>
      <Badge key={i} color="primary" style={{ margin: "3px", fontSize: "12pt" }}>
        {tag.tagName}
      </Badge>);

    let editingComponent = (
      <InputRow>
        <Col sm={10}>
          <Input type="text" placeholder="Тег" />
        </Col>
        <Col sm={2}>
          <Button outline color="primary" style={{ width: "100%" }}>Добавить</Button>
        </Col>
      </InputRow>
    );

    return (
      <React.Fragment>
        <InputRow>
          {tags}
        </InputRow>
        {editing ? editingComponent : null}
      </React.Fragment>
    );
  }

  initializeUploadDocumentFile() {
    const file = document.getElementById("uploadDocument");
    if (file) {
      file.click();
    }
  }

  async uploadDocumentFile(fileList: FileList | null) {
    if (!fileList || fileList.length == 0) {
      return;
    }

    const file = fileList[0];
    const id = await DocumentApi.uploadFile(file);
    this.changeDocument({ fileName: file.name, fileId: id });
    alert('upload ok');
  }

  render() {
    const { doc, editing } = this.state;

    return (
      <div>
        <DocInput label="Название">
          <Input readOnly={!editing} value={doc.title} onChange={x => this.changeDocument({ title: x.target.value })} />
        </DocInput>

        <DocInput label="Информанты">
          {this.renderInformant()}
        </DocInput>


        <DocInput label="Содержание">
          <Input readOnly={!editing} style={{ height: "200px", resize: "none" }} type="textarea" value={doc.content} />
        </DocInput>

        <DocInput label="Теги">
          {this.renderTags()}
        </DocInput>

        <DocInput label="Жанры">
          <Badge color="primary" style={{ margin: "3px", fontSize: "12pt" }}>Первый жанр</Badge>
          <Badge color="primary" style={{ margin: "3px", fontSize: "12pt" }}>Второй жанр</Badge>
          <Badge color="primary" style={{ margin: "3px", fontSize: "12pt" }}>И оооооочень длинннннный жанр</Badge>
        </ DocInput>

        <DocInput label="Документ">
          <InputRow>
            <Col sm={10}>
              <a href={DocumentApi.makeDocumentFileDownloadLink(doc.fileId || "")}>{doc.fileName}</a>
            </Col>
            {
              editing
                ? <Col sm={2}>
                  <input type="file" id="uploadDocument" style={{ display: "none" }} onChange={x => this.uploadDocumentFile(x.target.files)} />
                  <Button onClick={() => this.initializeUploadDocumentFile()} outline color="primary" style={{ width: "100%" }}>Загрузить</Button>
                </Col>
                : null
            }
          </InputRow>
        </DocInput>

        <DocInput label="">
          <InputRow>
            <Col sm={{ size: 2, offset: 10 }}>
              {
                editing
                  ? <Button outline color="success" style={{ width: "100%" }} onClick={() => this.saveChanges()}>Сохранить</Button>
                  : <Button outline color="secondary" style={{ width: "100%" }} onClick={() => this.startEditing()}>Изменить</Button>
              }
            </Col>
          </InputRow>
        </DocInput>
      </div>
    );
  }
}
