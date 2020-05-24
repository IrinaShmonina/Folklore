import * as React from 'react';
import DocumentApi from '../api/documentsApi';
import FolkDocument from '../models/Document';
import { Col, Button, Input, Badge, UncontrolledTooltip } from 'reactstrap';
import { Informant } from '../models/Informant';
import { InputRow } from '../components/InputRow';
import { DocInput } from '../components/DocInput';
import { Tag } from '../models/Tag';
import { Folklorist } from '../models/Folklorist';
import { Genre } from '../models/Genre';
import { MotivationalThematicClassification } from '../models/MotivationalThematicClassification';
import PlaceMap, { PlaceInfo } from './PlaceMap';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { parseMorphCsv, serializeMorphCsv } from '../utils/morph';
import { MorphInfo } from "../models/MorphInfo";

import './index.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { TableEditor } from './TableEditor';
import { downloadTextFile, uploadTextFile } from '../utils/files';
import Loader from './Loader';

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
  morph: MorphInfo[];
  loading: boolean;

  // for search
  informants: Informant[];
  searchLoadingInformant: boolean;
  searchLoadingFolklorist: boolean;
  searchLoadingTag: boolean;
  searchLoadingGenre: boolean;
  searchLoadingMTC: boolean;
  folklorists: Folklorist[];
  genres: Genre[];
  mtcs: MotivationalThematicClassification[];
  tags: Tag[];
}

export default class DocumentCard extends React.Component<DocumentCardProps, DocumentCardState> {
  constructor(props: DocumentCardProps, state: DocumentCardState) {
    super(props, state);
    this.state = {
      doc: props.doc,
      editing: props.editing,
      newInformant: {
        fio: ''
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
      informants: [],
      morph: parseMorphCsv(props.doc.morph),
      loading: false,
      // search
      searchLoadingInformant: false,
      searchLoadingFolklorist: false,
      searchLoadingTag: false,
      searchLoadingGenre: false,
      searchLoadingMTC: false,
      folklorists: [],
      genres: [],
      mtcs: [],
      tags: [],
    };
  }

  startEditing() {
    this.setState({ editing: true });
  }

  async saveChanges() {
    let { doc } = this.state;
    doc = {
      ...doc,
      morph: serializeMorphCsv(this.state.morph) // сохраянем редактированный morph
    }
    this.setState({ editing: false });
    await this.props.onDocSave(doc);
  }

  checkTitle() {
    let { doc } = this.state;
    let inputs: string[] = []

    if (doc.title === '' || doc.title.length > 200) {
      inputs.push('title')
    }
    if (doc.yearOfRecord < 1000 || doc.yearOfRecord > 9999) {
      inputs.push('yearOfRecord')
    }
    return inputs

  }

  checkUniqeId(array: {id?:number}[], id:number|undefined):boolean{
    if (!id){
      return true;
    }

    return array.every(x=>x.id !== id);
  }

  checkMinForms() {
    let { newFolklorist, newInformant, newTag, newGenre, newMTC, doc } = this.state;
    let inputs: string[] = []

    if (newFolklorist.fio === '' || newFolklorist.fio.length > 200 || !this.checkUniqeId(doc.folklorists,newFolklorist.id)) {
      inputs.push('newFolklorist')
    }
    if (newInformant.fio === '' || newInformant.fio.length > 200 || !this.checkUniqeId(doc.informants,newInformant.id)) {
      inputs.push('newInformant')
    }
    if (newInformant.yearOfBirth && (newInformant.yearOfBirth < 1000 || newInformant.yearOfBirth > 9999)) {
      inputs.push('newInformant')
    }
    if (newTag.tagName === '' || newTag.tagName.length > 50 || !this.checkUniqeId(doc.tags,newTag.id)) {
      inputs.push('newTag')
    }
    if (newGenre.genreName === '' || newGenre.genreName.length > 50 || !this.checkUniqeId(doc.genres,newGenre.id)) {
      inputs.push('newGenre')
    }
    if (newMTC.classificationName === '' || newMTC.classificationName.length > 50 || !this.checkUniqeId(doc.motivationalThematicClassifications,newMTC.id)) {
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
        fio: ''
      }
    });
  }

  deleteInformant(deleteIndex: number) {
    let { doc } = this.state;

    this.changeDocument({
      informants: doc.informants.filter((_, i) => i !== deleteIndex)
    });
  }

  async searchInformants(q: string) {
    this.setState({ searchLoadingInformant: true })
    this.setState({ informants: await DocumentApi.searchInformants(q) })
    this.setState({ searchLoadingInformant: false })
  }

  renderInformant() {
    const { doc, editing, newInformant, informants, searchLoadingInformant } = this.state;

    const informantComponents = doc.informants.map((informant, i) => (
      <InputRow key={i}>
        <Col sm={8}>
          <Input readOnly={true} type="text" value={informant.fio || ''} />
        </Col>
        <Col>
          <Input readOnly={true} type="number" value={informant.yearOfBirth || ''} />
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
            onInputChange={e => this.changeNewInformant({ fio: e, id: undefined })}
            onChange={e => e.length > 0 ? this.changeNewInformant({ id: e[0].id, fio: e[0].fio, yearOfBirth: e[0].yearOfBirth }) : ''}
            renderMenuItemChildren={(option) => (
              <div>
                <span>{option.fio} {option.yearOfBirth && `${option.yearOfBirth}г.р.`}</span>
              </div>
            )}
            ref={ref}
          /></Col>

        <Col sm={2}>
          <Input 
            type="number" 
            placeholder="Год" 
            value={newInformant.yearOfBirth || ''} 
            onChange={e => this.changeNewInformant({ yearOfBirth: parseInt(e.target.value, 10) || undefined, id: undefined})}
          />
        </Col>
        <Col sm={2}>
          <Button outline color="primary" style={{ width: "100%" }} disabled={recommendation.includes('newInformant')} onClick={() => { this.pushNewInformant(); ref.current.clear(); }}>Добавить</Button>
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
      folklorists: doc.folklorists.filter((_, i) => i !== deleteIndex)
    });
  }

  async searchFolklorists(q: string) {
    this.setState({ searchLoadingFolklorist: true })
    this.setState({ folklorists: await DocumentApi.searchFolklorist(q) })
    this.setState({ searchLoadingFolklorist: false })
  }


  renderFolklorist() {
    const { doc, editing, searchLoadingFolklorist, folklorists } = this.state;

    const folkloristComponents = doc.folklorists.map((folklorists, i) => (
      <InputRow key={i}>
        <Col sm={editing ? 10 : 12}>
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
            onInputChange={e => this.changeNewFolklorist({ fio: e ,id: undefined})}
            onChange={e => e.length > 0 ? this.changeNewFolklorist({ id: e[0].id, fio: e[0].fio }) : ''}
            renderMenuItemChildren={(option) => (
              <div>
                <span> {option.fio}</span>
              </div>
            )}
            ref={ref}
          /></Col>
        <Col sm={2}>
          <Button outline color="primary" style={{ width: "100%" }} disabled={recommendation.includes('newFolklorist')} onClick={() => { this.pushNewFolklorist(); ref.current.clear(); }}>Добавить</Button>
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
      tags: doc.tags.filter((_, i) => i !== deleteIndex)
    })
  }
  makeBadge(tagName: string, i: number) {
    const { editing } = this.state;
    if (editing) {
      return (
        <React.Fragment key={i}>
          <Badge id={`tag${i}`} color="primary" style={{ margin: "3px", fontSize: "12pt", cursor: "pointer" }} onClick={() => { this.deleteTag(i) }}>
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

  async searchTags(q: string) {
    this.setState({ searchLoadingTag: true })
    this.setState({ tags: await DocumentApi.searchTags(q) })
    this.setState({ searchLoadingTag: false })
  }


  renderTags() {
    const { doc, editing, tags, searchLoadingTag } = this.state;
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
            placeholder="Тег"
            onInputChange={e => this.changeNewTag({ tagName: e, id: undefined})}
            onChange={e => e.length > 0 ? this.changeNewTag({ id: e[0].id, tagName: e[0].tagName }) : ''}
            renderMenuItemChildren={(option) => (
              <div>
                <span> {option.tagName}</span>
              </div>
            )}
            ref={ref}
          /></Col>

        <Col sm={2}>
          <Button outline color="primary" style={{ width: "100%" }} disabled={recommendation.includes('newTag')} onClick={() => { this.pushNewTag(); ref.current.clear(); }}>Добавить</Button>
        </Col>
      </InputRow>
    );

    return (
      <React.Fragment>
        <InputRow>
          <Col>{t}</Col>
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
      genres: doc.genres.filter((_, i) => i !== deleteIndex)
    })
  }
  makeBadgeGenre(genreName: string, i: number) {
    const { editing } = this.state;
    if (editing) {
      return (
        <React.Fragment key={i}>
          <Badge id={`genre${i}`} color="primary" style={{ margin: "3px", fontSize: "12pt", cursor: "pointer" }} onClick={() => { this.deleteGenre(i) }}>
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

  async searchGenres(q: string) {
    this.setState({ searchLoadingGenre: true })
    this.setState({ genres: await DocumentApi.searchGenres(q) })
    this.setState({ searchLoadingGenre: false })
  }

  renderGenres() {
    const { doc, editing, searchLoadingGenre, genres } = this.state;
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
            labelKey = 'genreName'
            isLoading={searchLoadingGenre}
            minLength={3}
            options={genres}
            placeholder="Жанр"
            onInputChange={e => this.changeNewGenre({ genreName: e,id: undefined })}
            onChange={e => {
              if (e.length > 0) {
                this.changeNewGenre({ genreName: e[0].genreName, id: e[0].id})
              }
            }}
            renderMenuItemChildren={(option) => (
              <div>
                <span> {option.genreName}</span>
              </div>
            )}
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
          <Col>{g}</Col>
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
      motivationalThematicClassifications: doc.motivationalThematicClassifications.filter((_, i) => i !== deleteIndex)
    });
  }


  async searchMTCs(q: string) {
    this.setState({ searchLoadingMTC: true })
    this.setState({ mtcs: await DocumentApi.searchMTCs(q) })
    this.setState({ searchLoadingMTC: false })
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
            onInputChange={e => this.changeNewMTC({ classificationName: e,id: undefined })}
            onChange={e => e.length > 0 ? this.changeNewMTC({ id: e[0].id, classificationName: e[0].classificationName, code: e[0].code }) : ''}
            renderMenuItemChildren={(option) => (
              <div>
                <span>{option.classificationName} ({option.code})</span>
              </div>
            )}
            ref={ref}
          /></Col>
        <Col sm={2}>
          <Input type="text" placeholder="Код" value={newMTC.code} onChange={e => this.changeNewMTC({ code: e.target.value, id: undefined})} />
        </Col>
        <Col sm={2}>
          <Button outline color="primary" style={{ width: "100%" }} disabled={recommendation.includes('newMTC')} onClick={() => { this.pushNewMTC(); ref.current.clear(); }}>Добавить</Button>
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
          <PlaceMap onPlaceInfo={onPlaceInfo} coords={coords} />
        </Col>
      </InputRow>
    );

    return (
      <React.Fragment>
        <InputRow>
          <Col>
            <Input readOnly={true} type="text" value={doc.placeName || ''} onChange={x => this.changeDocument({ placeName: x.target.value })} />
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
    if (!fileList || fileList.length === 0) {
      return;
    }

    const file = fileList[0];
    this.setState({ loading: true })
    try {
      const id = await DocumentApi.uploadFile(file);
      this.changeDocument({ fileName: file.name, fileId: id });
    } finally {
      this.setState({ loading: false });
    }
  }

  renderContent() {
    const { doc: { content, morph }, editing } = this.state;
    if (editing) {
      return <Input
        style={{ height: "200px", resize: "none" }}
        type="textarea"
        value={content || ''}
        onChange={x => this.changeDocument({ content: x.target.value })}
      />;
    }

    if (!content) {
      return;
    }

    let wordRegex = /[а-яА-ЯёЁ-]+/g;
    let delimiter = '$$';
    let contentWithDelimiters = content.replace(wordRegex, str => `${delimiter}${str}${delimiter}`);

    const morphs = parseMorphCsv(morph);
    const parts = contentWithDelimiters.split(delimiter);

    const renderedParts: any[] = [];
    let currentWord = 0;
    parts.forEach((part, i) => {
      if (!wordRegex.test(part)) {
        renderedParts.push(part);
        return;
      }

      const morph: MorphInfo = morphs.length > currentWord
        ? morphs[currentWord]
        : { word: '', initialForm: '', partOfSpeach: '', grammaticalSigns: '' };

      const id = `word${currentWord}`;
      const renderedPart = (
        <React.Fragment key={i}>
          <span className="word" id={id}>{part}</span>
          <UncontrolledTooltip style={{ textAlign: "left" }} placement="bottom" target={id}>
            <span style={{ fontStyle: "italic" }}>Начальная форма:</span> {morph.initialForm}<br />
            <span style={{ fontStyle: "italic" }}>Часть речи:</span> {morph.partOfSpeach} <br />
            <span style={{ fontStyle: "italic" }}>Признаки:</span> {morph.grammaticalSigns} <br />
          </UncontrolledTooltip>
        </React.Fragment>
      );
      renderedParts.push(renderedPart);
      currentWord++;
    })

    return <p style={{ whiteSpace: "pre-line" }}>{renderedParts}</p>
  }

  exportMorphCsv() {
    const csv = serializeMorphCsv(this.state.morph);
    const name = this.state.doc.title.replace(/\s+/g, '_');
    downloadTextFile(`${name}.morph.csv`, csv);
  }

  importMorphCsv() {
    uploadTextFile(csv => {
      const morph = parseMorphCsv(csv);
      this.setState({ morph });
    }, '.csv');
  }

  async getMorphsForText() {
    const { doc } = this.state;
    const text = doc.content || "";
    if (/^\s+$/g.test(text)) {
      return;
    }
    this.setState({loading: true});
    try {
      const morph = await DocumentApi.getMorphs(text);
      this.setState({ morph })
    } finally {
      this.setState({loading: false});
    }
  }

  renderMorph() {
    const { doc } = this.state;

    return (
      <>
        <InputRow>
          <Col>
            <Button outline style={{width: '100%'}} onClick={() => this.exportMorphCsv()}>Экспорт в CSV</Button>
          </Col>
          <Col>
            <Button outline style={{width: '100%'}} onClick={() => this.importMorphCsv()}>Импорт из CSV</Button>
          </Col>
          <Col>
            <Button outline style={{width: '100%'}} onClick={() => this.getMorphsForText()}>Заполнить из Mystem</Button>
          </Col>
        </InputRow>
        <InputRow>
        
          <Col>
            <TableEditor
              header={['Слово', 'Начальная форма', 'Часть речи', 'Граматические признаки']}
              sizes={[20, 20, 15, 45]}
              columns={['word', 'initialForm', 'partOfSpeach', 'grammaticalSigns']}
              data={this.state.morph}
              emptyPlaceholder="Данных нет, заполните с помощью Mystem или экспортируйте из CSV файла"
              onChange={(row, col, value) => {
                const newMorph = [...this.state.morph]
                newMorph[row] = {
                  ...newMorph[row],
                  [col]: value.trim()
                }
                this.setState({ morph: newMorph });
              }}
              renderCell={(item, key) => item[key]}
            />
          </Col>
        </InputRow>

      </>
    );
  }

  render() {
    const { doc, editing, loading } = this.state;
    let block = this.checkTitle();

    return (
      <div>
        { loading && <Loader /> }
        <DocInput label="Название">
          <Input readOnly={!editing} value={doc.title} invalid={block.includes('title')} onChange={x => this.changeDocument({ title: x.target.value })} />
        </DocInput>

        <DocInput
          visible={doc.yearOfRecord !== 0 || editing}
          label="Год записи">
          <Input readOnly={!editing} type="number" value={doc.yearOfRecord} invalid={block.includes('yearOfRecord')} onChange={x => this.changeDocument({ yearOfRecord: parseInt(x.target.value, 10) || 2020 })} />
        </DocInput>

        <DocInput
          visible={doc.content !== '' || editing}
          label="Содержание">
           <div>
            {this.renderContent()}
          </div>
        </DocInput>

        <DocInput
          visible={doc.informants.length > 0 || editing}
          label="Информанты">
          {this.renderInformant()}
        </DocInput>

        <DocInput
          visible={doc.folklorists.length > 0 || editing}
          label="Фольклористы">
          {this.renderFolklorist()}
        </DocInput>

        <DocInput
          visible={doc.tags.length > 0 || editing}
          label="Теги">
          {this.renderTags()}
        </DocInput>

        <DocInput
          visible={doc.genres.length > 0 || editing}
          label="Жанры">
          {this.renderGenres()}
        </ DocInput>

        <DocInput
          visible={doc.motivationalThematicClassifications.length > 0 || editing}
          label="Мотивно-тематический классификатор">
          {this.renderMTC()}
        </ DocInput>

        <DocInput
          visible={doc.additionalInformation !== '' || editing}
          label="Дополнительная информация">
          <Input readOnly={!editing} style={{ height: "100px", resize: "none" }} type="textarea" value={doc.additionalInformation || ''} onChange={x => this.changeDocument({ additionalInformation: x.target.value })} />
        </DocInput>

        <DocInput
          visible={doc.fileName !== '' || editing}
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
          visible={doc.placeName !== '' || editing}
          label="Место">
          {this.renderPlace()}
        </DocInput>


        <DocInput
          visible={editing}
          label="Морфологический анализ">
            {this.renderMorph()}
        </DocInput>

        <DocInput label="">
          <InputRow>
            <Col>
              {
                editing
                  ? <Button outline color="success" style={{ width: "100%" }} disabled={block.length !== 0} onClick={() => this.saveChanges()}>Сохранить документ</Button>
                  : <Button outline color="secondary" style={{ width: "100%" }} onClick={() => this.startEditing()}>Изменить</Button>
              }
            </Col>
          </InputRow>
        </DocInput>
      </div>
    );
  }
}


