// @flow
import { dsvFormat } from 'd3-dsv';
import { writeFileSync } from 'filendir';
import fs from 'fs';
import _ from 'lodash/fp';
import * as topojson from 'topojson';

const
  // Helper to read and parse a json file
  readJSON: Function = _.flow(fs.readFileSync, JSON.parse),
  // Helper to read and parse a csv file
  parseCSV: Function = _.flow(filename => fs.readFileSync(filename, 'utf-8'), dsvFormat(';').parse),
  // initial geojson
  geojson: Object = readJSON('communes-metropole.geojson.json'),
  // its features
  features: Array<Object> = _.get('features', geojson),
  // list of merges
  merges: Array<Object> = parseCSV('data/insee/Communes nouvelles 2016-Tableau.csv'),
  // dictionary of merges by new INSEE id
  mergesByNewKey = _.keyBy(_.get('DepComN'), merges),
  // dictionary of merges by old INSEE id
  mergesByOldKey = _.keyBy(_.get('DepComA'), merges),
  // lodash/fp mapValues with no iteratee cap
  mapValuesWithKey: Function = _.mapValues.convert({ cap: false }),
  // list of features
  newFeatures: Array<Object> = _.flow(
    // group by new id commune (if merged) else current id
    _.groupBy((feature: Object) => {
      const
        { INSEE_COM: id } = feature.properties,
        isNewCommune: boolean = _.has(id, mergesByNewKey),
        isOldCommune: boolean = _.has(id, mergesByOldKey);
      // if is new commune
      if (isNewCommune) {
        return id;
      }
      // if is old commune
      if (isOldCommune) {
        return mergesByOldKey[id].DepComN
      }
      // else => return itself
      return id;
    }),
    // process the merged geojson thanks to topojson
    mapValuesWithKey((features, newId) => {
      // trivial case
      if (features.length === 1) {
        return _.first(features);
      }
      // merge o/
      console.log(newId);
      const
        topology = topojson.topology(features),
        geometry = topojson.merge(topology, _.values(topology.objects));
      return {
        type: 'Feature',
        geometry,
        properties: {
          INSEE_COM: newId,
          CODE_DEPT: newId.slice(0,2),
          NOM_COM: _.flow(
            _.get(_, mergesByNewKey),
            _.get('NomCN'),
            _.upperCase
          )(newId)
        }
      };
    }),
    _.values,
  )(features);

writeFileSync('communes-metropole-fusion.geojson.json', JSON.stringify({
  ...geojson,
  features: newFeatures
}));
