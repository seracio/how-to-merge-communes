# how-to-merge-communes

Le but de ce projet est de montrer comment générer un geojson à partir de : 
  
* une liste de fusions de communes de l'année en cours 
* un fichier GeoJSON du début de l'année en cours ()ne contenant donc pas les dernières fusions)  

## Récupération des shape files sur le site de l'IGN

Sur [geofla](http://professionnels.ign.fr/geofla), il est possible de récupérer les shape files qui 
nous serviront de base 
 
## Récupération des communes fusionnées sur le site de l'INSEE
 
Ce [fichier xsl](https://www.insee.fr/fr/information/2549968) liste les différentes fusions de 
l'année en cours. Il faut simplement le convertir en `csv` pour travailler plus facilement dessus

## Transformation des shape files en GeoJSON

Pour cela, on utilise `ogr2ogr`, l'important étant de bien spécifier l'option `-t_srs WGS84` pour convertir 
les shapes avec la bonne géodésie.
Le nouveau fichier GeoJSON `communes-metropole.geojson.json` se trouve à la racine. 
  
```
ogr2ogr -t_srs WGS84 -f 'GeoJSON' communes-metropole.geojson.json data/ign/COMMUNE.shp  
```  
##  Fusion programmatique des communes

Il faut lancer le script comme suit :

```
yarn start
```

Qui génère un fichier GeoJSON `communes-metropole-fusion.geojson.json` à la racine.
  
Le nouveau fichier devrait logiquement être plus léger :   

```
gzip -c communes-metropole.geojson.json | wc -c 
gzip -c communes-metropole-fusion.geojson.json | wc -c
```