# gisp-fccmaps-node
GIS Platform Node Webapp

## global install - prerequisites
1. Install node.js(> 5.6.x), npm (> 3.6.x) and git

2. Install bower
```npm install bower -g```
3. Install grunt
```npm install grunt-g```

5. Build client project
    *   navigate to root directory  
        ```
        cd gisp-fccmaps-node-fork
        ```  
        
    *   install node modules  
        ```
        npm install
       ```
       
    *   install client libraries  
        ```
        bower install
        ```
        
    *   build the app (HTML, LESS/CSS, JS), this will also copy the files from ```src``` to ```public\map_templates```  
        ```
        grunt
        ```
        
    *   run the app  
        ```
        node app.js
        ```
        
    *   view the app  
        ```
        http://localhost:6479/index.html
        ```    
