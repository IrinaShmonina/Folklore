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
import { AsyncTypeahead, TypeaheadModel, TypeaheadLabelKey } from 'react-bootstrap-typeahead';
import './card.css';

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
  valid: boolean;
  informants:Informant[];
  searchLoadingInformant:boolean;
  searchLoadingFolklorist:boolean;
  searchLoadingTag:boolean;
  searchLoadingGenre:boolean;
  searchLoadingMTC:boolean;
  folklorists:Folklorist[];
  genres:Genre[];
  mtcs:MotivationalThematicClassification[];
  tags:Tag[]
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
      valid: false,
      informants:[],
      searchLoadingInformant:false,
      searchLoadingFolklorist:false,
      searchLoadingTag:false,
      searchLoadingGenre:false,
      searchLoadingMTC:false,
      folklorists:[],
      genres:[],
      mtcs:[],
      tags:[]
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
    if (doc.yearOfRecord<=1000){
      inputs.push('yearOfRecord')
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

  async searchInformants(q:string){
    this.setState({searchLoadingInformant:true})
    this.setState({informants: await DocumentApi.searchInformants(q)})
    this.setState({searchLoadingInformant:false})
  }

  renderInformant() {
    const { doc, editing, newInformant,informants,searchLoadingInformant } = this.state;
    
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
    let ref = React.createRef<any>()
    const editingComponent = (
      <InputRow>
        <Col sm={8}>
        <AsyncTypeahead
        id="labelkey-example"
        labelKey="fio"
        onSearch={(q) => this.searchInformants(q)}
        isLoading={searchLoadingInformant}
        minLength={3}
        options={informants}
        placeholder="ФИО"
        onInputChange={e => this.changeNewInformant({ fio: e })}
        onChange={e => e.length>0?this.changeNewInformant({ id:e[0].id, fio: e[0].fio, yearOfBirth: e[0].yearOfBirth}):''}
        renderMenuItemChildren={(option) => (
          <div>
          <span> {option.fio}</span>
          </div>
        )}
        ref={ref}
      /></Col>
        
        <Col sm={2}>
          <Input type="number" placeholder="Год" value={newInformant.yearOfBirth} onChange={e => this.changeNewInformant({ yearOfBirth: parseInt(e.target.value, 10) })} />
        </Col>
        <Col sm={2}>
          <Button outline color="primary" style={{ width: "100%" }} disabled={recommendation.includes('newInformant')} onClick={() => {this.pushNewInformant();ref.current.clear();}}>Добавить</Button>
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

  async searchFolklorists(q:string){
    this.setState({searchLoadingFolklorist:true})
    this.setState({folklorists: await DocumentApi.searchFolklorist(q)})
    this.setState({searchLoadingFolklorist:false})
  }


  renderFolklorist() {
    const { doc, editing, newFolklorist, searchLoadingFolklorist,folklorists } = this.state;

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
    let ref = React.createRef<any>()
    const editingComponent = (
      <InputRow>
        <Col sm={10}>
        <AsyncTypeahead
        id="labelkey-example"
        labelKey="fio"
        onSearch={(q) => this.searchFolklorists(q)}
        isLoading={searchLoadingFolklorist}
        minLength={3}
        options={folklorists}
        placeholder="ФИО"
        onInputChange={e => this.changeNewFolklorist({ fio: e })}
        onChange={e => e.length>0?this.changeNewFolklorist({ id:e[0].id, fio: e[0].fio}):''}
        renderMenuItemChildren={(option) => (
          <div>
          <span> {option.fio}</span>
          </div>
        )}
        ref={ref}
      /></Col>
        <Col sm={2}>
          <Button outline color="primary" style={{ width: "100%" }} disabled={recommendation.includes('newFolklorist')} onClick={() => {this.pushNewFolklorist();ref.current.clear();}}>Добавить</Button>
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

  async searchTags(q:string){
    this.setState({searchLoadingTag:true})
    this.setState({tags: await DocumentApi.searchTags(q)})
    this.setState({searchLoadingTag:false})
  }
  

  renderTags() {
    const { doc, editing, newTag, tags,searchLoadingTag } = this.state;
    let t = doc.tags.map((tag, i) =>
      this.makeBadge(tag.tagName, i)
    );
    let recommendation = this.checkMinForms();
    let ref = React.createRef<any>()
    let editingComponent = (

      <InputRow>
        
        <Col sm={10}>
        <AsyncTypeahead
        id="labelkey-example"
        labelKey="tagName"
        onSearch={(q) => this.searchTags(q)}
        isLoading={searchLoadingTag}
        minLength={3}
        options={tags}
        placeholder="ФИО"
        onInputChange={e => this.changeNewTag({ tagName: e })}
        onChange={e => e.length>0?this.changeNewTag({ id:e[0].id, tagName: e[0].tagName}):''}
        renderMenuItemChildren={(option) => (
          <div>
          <span> {option.tagName}</span>
          </div>
        )}
        ref={ref}
        /></Col>
        
        <Col sm={2}>
          <Button outline color="primary" style={{ width: "100%" }} disabled={recommendation.includes('newTag')} onClick={() => {this.pushNewTag();ref.current.clear();}}>Добавить</Button>
        </Col>
      </InputRow>
    );

    return (
      <React.Fragment>
        <InputRow>
          <Col>{t}

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

async searchGenres(q:string){
  this.setState({searchLoadingGenre:true})
  this.setState({genres: await DocumentApi.searchGenres(q)})
  this.setState({searchLoadingGenre:false})
}

renderGenres() {
  const { doc, editing, newGenre, searchLoadingGenre, genres } = this.state;
  let g = doc.genres.map((genre, i) =>
    this.makeBadgeGenre(genre.genreName, i)
  );
  let recommendation = this.checkMinForms();
  let ref = React.createRef<any>()
  let editingComponent = (

    <InputRow>
      <Col sm={10}>
        <AsyncTypeahead
        id="labelkey-example"
        onSearch={(q) => this.searchGenres(q)}
        isLoading={searchLoadingGenre}
        minLength={3}
        options={genres.map((genre) => genre.genreName)}
        placeholder="Жанр"
        onInputChange={e => this.changeNewGenre({ genreName: e })}
        onChange={e => {
          if (e.length > 0) {
            this.changeNewGenre({ genreName: e[0] })
          }
        }}
        ref={ref}
      /></Col>
      <Col sm={2}>
        <Button 
          outline
          color="primary"
          style={{ width: "100%" }} 
          disabled={recommendation.includes('newGenre')} 
          onClick={() => {
            this.pushNewGenre();
            ref.current.clear();
          }}
        >
            Добавить
        </Button>
      </Col>
    </InputRow>
  );

  return (
    <React.Fragment>
      <InputRow>
        <Col>{g}

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


async searchMTCs(q:string){
  this.setState({searchLoadingMTC:true})
  this.setState({mtcs: await DocumentApi.searchMTCs(q)})
  this.setState({searchLoadingMTC:false})
}

renderMTC() {
  const { doc, editing, newMTC, searchLoadingMTC, mtcs } = this.state;

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
  let ref = React.createRef<any>()
  const editingComponent = (
    <InputRow>
      <Col sm={8}>
        <AsyncTypeahead
        id="labelkey-example"
        labelKey="classificationName"
        onSearch={(q) => this.searchMTCs(q)}
        isLoading={searchLoadingMTC}
        minLength={3}
        options={mtcs}
        placeholder="Мотив или тематика"
        onInputChange={e => this.changeNewMTC({ classificationName: e })}
        onChange={e => e.length>0?this.changeNewMTC({ id:e[0].id, classificationName: e[0].classificationName, code: e[0].code}):''}
        renderMenuItemChildren={(option) => (
          <div>
          <span> {option.classificationName}</span>
          </div>
        )}
        ref={ref}
      /></Col>
      <Col sm={2}>
        <Input type="text" placeholder="Код" value={newMTC.code} onChange={e => this.changeNewMTC({ code: e.target.value})} />
      </Col>
      <Col sm={2}>
        <Button outline color="primary" style={{ width: "100%" }} disabled={recommendation.includes('newMTC')} onClick={() => {this.pushNewMTC();ref.current.clear();}}>Добавить</Button>
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
            <Input readOnly={true} type="text" value={doc.placeName} onChange={x => this.changeDocument({ placeName: x.target.value })} />
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

  renderContent() {
    const { doc: { content } } = this.state;
    if (!content) {
      return;
    }

    const words = content.split(' ');
    return (
      <p>
        {words.map((w, i) => 
          <>
            <span className="word" id={`word${i}`}>{w + ' '}</span>
            {<UncontrolledTooltip placement="bottom" target={`word${i}`}>I am {w}</UncontrolledTooltip>}
          </>)
        }
      </p>
    );
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
        visible = {doc.yearOfRecord!=0||editing}
        label="Год записи">
          <Input readOnly={!editing} type="number" value={doc.yearOfRecord} onChange={x => this.changeDocument({ yearOfRecord: parseInt(x.target.value, 10) })} />
        </DocInput>

        <DocInput 
          visible={doc.content!=''||editing} 
          label="Содержание">
          {/*<Input readOnly={!editing} style={{ height: "200px", resize: "none" }} type="textarea" value={doc.content} onChange={x => this.changeDocument({ content: x.target.value })} /> */}
          <div>
            {this.renderContent()}
          </div>
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

        
        <DocInput 
        visible = {editing}
        label="Морфологический анализ">       
          <Input readOnly={!editing} style={{ height: "200px", resize: "none" }} type="textarea" value={doc.morph} onChange={x => this.changeDocument({ morph: x.target.value })} />
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
