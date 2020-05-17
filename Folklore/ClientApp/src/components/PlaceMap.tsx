import * as React from 'react';
import { YMaps, Map, SearchControl, Placemark, FullscreenControl, withYMaps } from 'react-yandex-maps';

export interface PlaceInfo {
  addressLine: string;
  latitude: number;
  longtitude: number;
}

export interface PlaceMapProps {
  coords?: number[];
  ymaps?: any;
  onPlaceInfo: (placeInfo: PlaceInfo) => void;
}

export interface PlaceMapState {
  addressLine?: string;
  coords?: number[];
  mapAdded: boolean;
  searchAdded: boolean;
}

class PlaceMapComponent extends React.Component<PlaceMapProps, PlaceMapState> {
  constructor(props: PlaceMapProps, state: PlaceMapState) {
    super(props, state);
    this.state = {
      coords: props.coords,
      mapAdded: false,
      searchAdded: false
    };
  }

  updateCoords(coords: number[]) {
    if (!coords || coords.length != 2) {
      return;
    }

    this.setState({ coords });

    this.props.ymaps.geocode(coords).then((x: any) => {
      let firstGeoObject = x.geoObjects.get(0);
      let address = firstGeoObject.getAddressLine();
      this.setState({addressLine: address});

      this.props.onPlaceInfo({
        addressLine: address,
        latitude: coords[0],
        longtitude: coords[1]
      })
    });
  }

  render() {
    const { coords, addressLine } = this.state;
    const placemark = coords ? <Placemark geometry={coords} /> : null;

    return (
        <Map defaultState={{ center: this.props.coords || [55.75, 37.57], zoom: 9,  controls: []}}
          options={{yandexMapDisablePoiInteractivity: true}}
          width="100%"
          instanceRef={(ref: any) => {
            if (!ref) {
              return;
            }
            if (this.state.mapAdded) {
              return;
            }
            this.setState({mapAdded: true});
            
            ref.events.add('click', (e: any) => this.updateCoords(e.get('coords')));
          }}>
          <FullscreenControl />
          <SearchControl options={{ float: 'right', noPlacemark: true }}
            instanceRef={(ref: any) => {
              if (!ref) {
                return;
              }

              if (this.state.searchAdded) {
                return;
              }

              this.setState({searchAdded: true});

              ref.events.add('resultshow', (e: any) => {
                ref.getResult(e.originalEvent.index)
                   .then((x: any) => this.updateCoords(x.geometry.getCoordinates()));
              });
            }}
          />
          {placemark}
        </Map>
    );
  }
}


const PlaceMap = withYMaps(PlaceMapComponent, true, ["geocode"]);

export default PlaceMap;
