# gisp-fccmaps-node
GIS Platform Node Webapp

## global install - prerequisites
1. Install node.js(> 5.6.x), npm (> 3.6.x) and git

2. Install bower
```npm install bower -g```
3. Install grunt
```npm install grunt-g```

5. Build client project
    *   Navigate to root directory.  
        ```
        cd gisp-fccmaps-node-fork
        ```  
        
    *   Install node modules.  
        ```
        npm install
        ```
       
    *   Install client libraries.  
        ```
        bower install
        ```
        
    *   Build the JSON, LESS/CSS, and JS files. This will also copy the files from ```src``` to ```public```.  
        ```
        grunt
        ```

    *   Run the watch task to automatically run grunt everytime a file in the ```src``` folder changes.  
        ```
        grunt watch
        ```

        
    *   Run the app.  
        ```
        node app.js
        ```
        
    *   View the app.  
        ```
        http://localhost:6479/index.html
        ```    
