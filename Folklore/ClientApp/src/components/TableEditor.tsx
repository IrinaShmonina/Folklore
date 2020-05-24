import * as React from 'react';
import { Table, Input, InputGroup, InputProps } from 'reactstrap';

import 'bootstrap/dist/css/bootstrap.min.css';
import TextareaAutosize from 'react-textarea-autosize';

export interface TableEditorProps<T> {
  header: string[];
  sizes: number[];
  columns: (keyof T)[];
  data: T[];
  emptyPlaceholder: string;
  onChange: (row: number, column: keyof T, value: string) => void;
  renderCell: (item: T, key: keyof T) => string;
}

interface TableEditorState {
  editingRow?: number;
  editingColumn?: number;
}

export class TableEditor<T> extends React.Component<TableEditorProps<T>, TableEditorState> {
  constructor(props: TableEditorProps<T>, state: TableEditorState) {
    super(props, state);
    this.state = {};
  }

  startEditing(rowIndex: number, colIndex: number) {
    this.setState({ editingRow: rowIndex, editingColumn: colIndex });
  }

  finishEditing(value: string) {
    const { columns } = this.props;
    const { editingRow, editingColumn } = this.state;

    if (editingRow === undefined || editingColumn === undefined) {
      return;
    }

    this.props.onChange(editingRow, columns[editingColumn], value);
    this.setState({ editingRow: undefined, editingColumn: undefined });
  }

  renderBody() {
    const { header, columns, data, emptyPlaceholder } = this.props;
    const { editingRow, editingColumn } = this.state;
    if (data.length === 0) {
      return <tbody>
        <tr>
          <td colSpan={header.length} style={{ textAlign: 'center' }}>{emptyPlaceholder}</td>
        </tr>
      </tbody>;
    }
    return <tbody>
      {
        data.map((item, rowIndex) =>
          <tr key={rowIndex}>
            {
              columns.map((column, colIndex) => {
                const value = this.props.renderCell(item, column);
                const editing = rowIndex === editingRow && colIndex === editingColumn;
                const content = editing
                  ? <InputGroup size="sm">
                    <TextareaAutosize
                      className="form-control"
                      style={{ resize: 'none' }}
                      defaultValue={value}
                      autoFocus={true}
                      onBlur={e => this.finishEditing(e.target.value)}
                    />
                  </InputGroup>
                  : value;

                const width = this.props.sizes[colIndex];
                const widthStyle = `${width}%`;
                const paddingStyle = editing ? { padding: 0 } : {};
                return (
                  <td style={{ ...paddingStyle, width: widthStyle, whiteSpace: "pre-line" }}
                    key={colIndex}
                    onClick={() => this.startEditing(rowIndex, colIndex)}
                  >
                    {content}
                  </td>
                );
              })
            }
          </tr>
        )
      }
    </tbody>;
  }

  render() {
    const { header } = this.props;

    return (
      <Table bordered size="sm">
        <thead>
          <tr>
            {header.map((c, i) => <th key={i}>{c}</th>)}
          </tr>
        </thead>
        {this.renderBody()}
      </Table>
    );
  }
}