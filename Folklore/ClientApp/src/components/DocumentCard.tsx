import * as React from 'react';
import DocumentApi from '../api/documentsApi';
import FolkDocument from '../models/Document';
import { Col, Button, Input, Badge, Card, UncontrolledTooltip } from 'reactstrap';
import { Informant } from '../models/Informant';
import { InputRow } from '../components/InputRow';
import { DocInput } from '../components/DocInput';
import { Tag } from '../models/Tag';
import { Folklorist } from '../models/Folklorist';
import { Genre } from '../models/Genre';
import { MotivationalThematicClassification } from '../models/MotivationalThematicClassification';
import PlaceMap, { PlaceInfo } from './PlaceMap';

export interface DocumentCardProps {
  doc: FolkDocument;
  editing: boolean;
  onDocSave: (doc: FolkDocument) => Promise<void>;
}

export interface DocumentCardState {
  doc: FolkDocument;
  editing: boolean;
  newInformant: Informant;
  newFolklorist: Folklorist;
  newTag: Tag;
  newGenre: Genre;
  newMTC: MotivationalThematicClassification;
  valid: boolean
}


export default class DocumentCard extends React.Component<DocumentCardProps, DocumentCardState> {
  constructor(props: DocumentCardProps, state: DocumentCardState) {
    super(props, state);
    this.state = {
      doc: props.doc,
      editing: props.editing,
      newInformant: {
        fio: '',
        yearOfBirth: 1990
      },
      newFolklorist: {
        fio: ''
      },
      newTag: {
        tagName: ''
      },
      newGenre: {
        genreName: ''
      },
      newMTC: {
        code: '',
        classificationName: ''
      },
      valid: false
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


  checkTitle(){
    let { doc } = this.state;
    let inputs:string[] = []
    
    if (doc.title==''||doc.title.length>200){
      inputs.push('title')
    }
    return inputs

  }

  checkMinForms(){
    let { doc,newFolklorist,newInformant,newTag, newGenre, newMTC } = this.state;
    let inputs:string[] = []
    
    if (newFolklorist.fio ==''||newFolklorist.fio.length>200){
      inputs.push('newFolklorist')
    }
    if (newInformant.fio ==''||newInformant.fio.length>200){
      inputs.push('newInformant')
    }
    if (newTag.tagName ==''||newTag.tagName.length>50){
      inputs.push('newTag')
    }
    if (newGenre.genreName ==''||newGenre.genreName.length>50){
      inputs.push('newGenre')
    }
    if (newMTC.classificationName ==''||newMTC.classificationName.length>50){
      inputs.push('newMTC')
    }
    return inputs

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
    this.setState({
      newInformant: {
        fio: '',
        yearOfBirth: 1990
      }
    });
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

    let recommendation = this.checkMinForms();
    const editingComponent = (
      <InputRow>
        <Col sm={8}>
          <Input type="text" placeholder="ФИО" value={newInformant.fio} onChange={e => this.changeNewInformant({ fio: e.target.value })} />
        </Col>
        <Col sm={2}>
          <Input type="number" placeholder="Год" value={newInformant.yearOfBirth} onChange={e => this.changeNewInformant({ yearOfBirth: parseInt(e.target.value, 10) })} />
        </Col>
        <Col sm={2}>
          <Button outline color="primary" style={{ width: "100%" }} disabled={recommendation.includes('newInformant')} onClick={() => this.pushNewInformant()}>Добавить</Button>
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

  changeNewFolklorist(partialFolklorist: Partial<Folklorist>) {
    let { newFolklorist } = this.state;

    this.setState({
      newFolklorist: {
        ...newFolklorist,
        ...partialFolklorist
      }
    });
  }

  pushNewFolklorist() {
    let { newFolklorist, doc } = this.state;

    this.changeDocument({
      folklorists: [
        ...doc.folklorists,
        newFolklorist
      ]
    });
    this.setState({
      newFolklorist: {
        fio: ''
      }
    });
  }

  deleteFolklorist(deleteIndex: number) {
    let { doc } = this.state;

    this.changeDocument({
      folklorists: doc.folklorists.filter((_, i) => i != deleteIndex)
    });
  }

  renderFolklorist() {
    const { doc, editing, newFolklorist } = this.state;

    const folkloristComponents = doc.folklorists.map((folklorists, i) => (
      <InputRow key={i}>
        <Col sm={editing?10:12}>
          <Input readOnly={true} type="text" value={folklorists.fio} />
        </Col>
        {editing
          ? <Col>
            <Button outline onClick={() => this.deleteFolklorist(i)} color="danger" style={{ width: "100%" }}>Удалить</Button>
          </Col>
          : null}
      </InputRow>
    ));

    let recommendation = this.checkMinForms();
    const editingComponent = (
      <InputRow>
        <Col sm={10}>
          <Input type="text" placeholder="ФИО" value={newFolklorist.fio} onChange={e => this.changeNewFolklorist({ fio: e.target.value })} />
        </Col>
        <Col sm={2}>
          <Button outline color="primary" style={{ width: "100%" }} disabled={recommendation.includes('newFolklorist')} onClick={() => this.pushNewFolklorist()}>Добавить</Button>
        </Col>
      </InputRow>
    );

    return (
      <React.Fragment>
        {folkloristComponents}
        {editing ? editingComponent : null}
      </React.Fragment>
    );
  }


  changeNewTag(partialTag: Partial<Tag>) {
    let { newTag } = this.state;

    this.setState({
      newTag: {
        ...newTag,
        ...partialTag
      }
    })
  }

  pushNewTag() {
    let { newTag, doc } = this.state;

    this.changeDocument({
      tags: [
        ...doc.tags,
        newTag
      ]
    });
    this.setState({
      newTag: {
        tagName: ''
      }
    });
  }
  deleteTag(deleteIndex: number) {
    let { doc } = this.state;
    this.changeDocument({
      tags: doc.tags.filter((_, i) => i != deleteIndex)
    })
  }
  makeBadge(tagName: string, i: number) {
    const { doc, editing } = this.state;
    if (editing) {
      return (
        <React.Fragment>
          <Badge id={`tag${i}`} key={i} color="primary" style={{ margin: "3px", fontSize: "12pt", cursor: "pointer" }} onClick={() => { this.deleteTag(i) }}>
            {tagName}
          </Badge>
          <UncontrolledTooltip placement="bottom" target={`tag${i}`}>
            Нажмите, чтобы удалить
      </UncontrolledTooltip>
        </React.Fragment>);
    }

    return (<Badge key={i} color="primary" style={{ margin: "3px", fontSize: "12pt" }}>
      {tagName}
    </Badge>);
  }
  renderTags() {
    const { doc, editing, newTag } = this.state;
    let tags = doc.tags.map((tag, i) =>
      this.makeBadge(tag.tagName, i)
    );
    let recommendation = this.checkMinForms();
    let editingComponent = (

      <InputRow>
        <Col sm={10}>
          <Input type="text" placeholder="Тег" value={newTag.tagName} onChange={x => this.changeNewTag({ tagName: x.target.value })} />
        </Col>
        <Col sm={2}>
          <Button outline color="primary" style={{ width: "100%" }} disabled={recommendation.includes('newTag')} onClick={() => this.pushNewTag()}>Добавить</Button>
        </Col>
      </InputRow>
    );

    return (
      <React.Fragment>
        <InputRow>
          <Col>{tags}

          </Col>

        </InputRow>
        {editing ? editingComponent : null}
      </React.Fragment>
    );
  }

//genre
changeNewGenre(partialGenre: Partial<Genre>) {
  let { newGenre } = this.state;

  this.setState({
    newGenre: {
      ...newGenre,
      ...partialGenre
    }
  })
}

pushNewGenre() {
  let { newGenre, doc } = this.state;

  this.changeDocument({
    genres: [
      ...doc.genres,
      newGenre
    ]
  });
  this.setState({
    newGenre: {
      genreName: ''
    }
  });
}
deleteGenre(deleteIndex: number) {
  let { doc } = this.state;
  this.changeDocument({
    genres: doc.genres.filter((_, i) => i != deleteIndex)
  })
}
makeBadgeGenre(genreName: string, i: number) {
  const { doc, editing } = this.state;
  if (editing) {
    return (
      <React.Fragment>
        <Badge id={`genre${i}`} key={i} color="primary" style={{ margin: "3px", fontSize: "12pt", cursor: "pointer" }} onClick={() => { this.deleteGenre(i) }}>
          {genreName}
        </Badge>
        <UncontrolledTooltip placement="bottom" target={`genre${i}`}>
          Нажмите, чтобы удалить
    </UncontrolledTooltip>
      </React.Fragment>);
  }

  return (<Badge key={i} color="primary" style={{ margin: "3px", fontSize: "12pt" }}>
    {genreName}
  </Badge>);
}
renderGenres() {
  const { doc, editing, newGenre } = this.state;
  let genres = doc.genres.map((genre, i) =>
    this.makeBadgeGenre(genre.genreName, i)
  );
  let recommendation = this.checkMinForms();
  let editingComponent = (

    <InputRow>
      <Col sm={10}>
        <Input type="text" placeholder="Жанр" value={newGenre.genreName} onChange={x => this.changeNewGenre({ genreName: x.target.value })} />
      </Col>
      <Col sm={2}>
        <Button outline color="primary" style={{ width: "100%" }} disabled={recommendation.includes('newGenre')} onClick={() => this.pushNewGenre()}>Добавить</Button>
      </Col>
    </InputRow>
  );

  return (
    <React.Fragment>
      <InputRow>
        <Col>{genres}

        </Col>

      </InputRow>
      {editing ? editingComponent : null}
    </React.Fragment>
  );
}

//мтк
changeNewMTC(partialMTC: Partial<MotivationalThematicClassification>) {
  let { newMTC } = this.state;

  this.setState({
    newMTC: {
      ...newMTC,
      ...partialMTC
    }
  });
}


pushNewMTC() {
  let { newMTC, doc } = this.state;

  this.changeDocument({
    motivationalThematicClassifications: [
      ...doc.motivationalThematicClassifications,
      newMTC
    ]
  });
  this.setState({
    newMTC: {
      code: '',
      classificationName: ''
    }
  });
}

deleteMTC(deleteIndex: number) {
  let { doc } = this.state;

  this.changeDocument({
    motivationalThematicClassifications: doc.motivationalThematicClassifications.filter((_, i) => i != deleteIndex)
  });
}

renderMTC() {
  const { doc, editing, newMTC } = this.state;

  const mtcComponents = doc.motivationalThematicClassifications.map((mtc, i) => (
    <InputRow key={i}>
      <Col sm={8}>
        <Input readOnly={true} type="text" value={mtc.classificationName} />
      </Col>
      <Col>
        <Input readOnly={true} type="text" value={mtc.code} />
      </Col>
      {editing
        ? <Col>
          <Button outline onClick={() => this.deleteMTC(i)} color="danger" style={{ width: "100%" }}>Удалить</Button>
        </Col>
        : null}
    </InputRow>
  ));

  let recommendation = this.checkMinForms();
  const editingComponent = (
    <InputRow>
      <Col sm={8}>
        <Input type="text" placeholder="Мотив или тематика" value={newMTC.classificationName} onChange={e => this.changeNewMTC({ classificationName: e.target.value })} />
      </Col>
      <Col sm={2}>
        <Input type="text" placeholder="Код" value={newMTC.code} onChange={e => this.changeNewMTC({ code: e.target.value})} />
      </Col>
      <Col sm={2}>
        <Button outline color="primary" style={{ width: "100%" }} disabled={recommendation.includes('newMTC')} onClick={() => this.pushNewMTC()}>Добавить</Button>
      </Col>
    </InputRow>
  );

  return (
    <React.Fragment>
      {mtcComponents}
      {editing ? editingComponent : null}
    </React.Fragment>
  );
}

  renderPlace() {
    const { editing, doc } = this.state;

    let coords = doc.placeLatitude && doc.placeLongitude ? [doc.placeLatitude, doc.placeLongitude] : undefined;
    let onPlaceInfo = (placeInfo: PlaceInfo) => {
      this.changeDocument({
        placeName: placeInfo.addressLine,
        placeLatitude: placeInfo.latitude,
        placeLongitude: placeInfo.longtitude
      });
    }

    let editingComponent = (
      <InputRow>
        <Col>
          <PlaceMap onPlaceInfo={onPlaceInfo} coords={coords}/>
        </Col>
      </InputRow>
    );

    return (
      <React.Fragment>
        <InputRow>
          <Col>
            <Input readOnly={!editing} type="text" value={doc.placeName} onChange={x => this.changeDocument({ placeName: x.target.value })} />
          </Col>
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
    let block = this.checkTitle();
    

    return (
      <div>
        <DocInput label="Название">
          <Input readOnly={!editing} value={doc.title} invalid={block.includes('title')} onChange={x => this.changeDocument({ title: x.target.value })}/>
        </DocInput>

        <DocInput 
          visible={doc.informants.length>0||editing}
          label="Информанты">
          {this.renderInformant()}
        </DocInput>

        <DocInput 
          visible={doc.folklorists.length>0||editing}
          label="Фольклористы">
          {this.renderFolklorist()}
        </DocInput>

        <DocInput 
          visible={doc.content!=''||editing} 
          label="Содержание">
          <Input readOnly={!editing} style={{ height: "200px", resize: "none" }} type="textarea" value={doc.content} onChange={x => this.changeDocument({ content: x.target.value })} />
        </DocInput>

        <DocInput 
          visible={doc.tags.length>0||editing} 
          label="Теги">
          {this.renderTags()}
        </DocInput>

        <DocInput 
          visible = {doc.genres.length>0||editing}
          label="Жанры">
          {this.renderGenres()}
        </ DocInput>

        <DocInput 
          visible = {doc.motivationalThematicClassifications.length>0||editing}
          label="Мотивно-тематический классификатор">
          {this.renderMTC()}
        </ DocInput>

       <DocInput 
        visible = {doc.additionalInformation!=''||editing}
        label="Дополнительная информация">
          <Input readOnly={!editing} style={{ height: "100px", resize: "none" }} type="textarea" value={doc.additionalInformation} onChange={x => this.changeDocument({ additionalInformation: x.target.value })} />
        </DocInput>

        <DocInput
          visible = {doc.fileName!=''||editing}
          label="Документ">
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

       <DocInput 
        visible = {doc.placeName!=''||editing}
        label="Место">
          {this.renderPlace()}
        </DocInput>

        <DocInput label="">
          <InputRow>
            <Col sm={{ size: 2, offset: 10 }}>
              {
                editing
                  ? <Button outline color="success" style={{ width: "100%" }} disabled={block.length!=0} onClick={() => this.saveChanges()}>Сохранить</Button>
                  : <Button outline color="secondary" style={{ width: "100%" }} onClick={() => this.startEditing()}>Изменить</Button>
              }
            </Col>
          </InputRow>
        </DocInput>
      </div>
    );
  }
}
