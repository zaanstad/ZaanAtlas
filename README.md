# ZaanAtlas

These instructions describe how to deploy the [ZaanAtlas](https://geo.zaanstad.nl/zaanatlas) assuming you have a copy of the application source code from GitHub.

## Getting a copy of the application

To get a copy of the application source code, use git:

    git clone git@github.com:zaanstad/ZaanAtlas.git

## Dependencies

The ZaanAtlas repository contains what you need to run the application as a servlet with an integrated persistence layer. Due to its age, the application only runs under Java 5.

To assemble the servlet or run in development mode, you need [Ant](http://ant.apache.org/). 

    sudo apt remove ant
    cd /tmp
    wget https://apache.newfountain.nl//ant/binaries/apache-ant-1.9.15-bin.tar.gz
    sudo tar -xf apache-ant-1.9.15-bin.tar.gz -C /opt/

Expose the location of the `ant` executable to the runtime environment.

On *nux operating systems:

    export ANT_HOME=/opt/apache-ant-1.9.15/
    export PATH=${ANT_HOME}/bin:${PATH}

In addition, to pull in external dependencies, you'll neeed [Git](http://git-scm.com/) installed. Furthermore, generate a [Personal Access Token](https://github.com/settings/tokens) (PAT) at GitHub to authenticate.

    export MY_GIT_TOKEN=***********************************
    echo 'echo $MY_GIT_TOKEN' > $HOME/.git-askpass
    chmod +x $HOME/.git-askpass
    export GIT_ASKPASS=$HOME/.git-askpass

Before running in development mode or preparing the application for deployment, you need to pull in external dependencies. Do this by running `ant init` in the ZaanAtlas directory:

    ant init

## Running in development mode

The application can be run in development or distribution mode.  In development mode, individual scripts are available to a debugger.  In distribution mode, scripts are concatenated and minified.

To run the application in development mode, run:

    ant debug

If the build succeeds, you'll be able to browse to the application at http://localhost:8080/.

By default, the application runs on port 8080.  To change this, you can set the `app.port` property as follows (setting the port to 9080):

    ant -Dapp.port=9080 debug

In addition, if you want to make a remote GeoServer available at the `/geoserver/` path, you can set the `app.proxy.geoserver` system property as follows:

    ant -Dapp.proxy.geoserver=https://geo.zaanstad.nl/geoserver/ debug

## Preparing the application for deployment

Running the ZaanAtlas as described above is not suitable for production because JavaScript files will be loaded dynamically.  Before moving your application to a production environment, run ant with the "dist" target.  The "dist" target will result in a directory that can be dropped in a servlet container.

    ant dist

Move the build directory to your production environment (i.e. the Jetty servlet container).

ZaanAtlas writes to a `geoexplorer.db` when saving maps.  The location of this file is determined by the `GEOEXPLORER_DATA` value at runtime.  This value can be set as a servlet initialization parameter or a Java system property.

The `GEOEXPLORER_DATA` value must be a path to a directory that is writable by  the process that runs the application.  The servlet initialization parameter is given precedence over a system property if both exist.

As an example, if you want the `geoexplorer.db` file to be written to your `/tmp` directory, modify GeoExplorer's `web.xml` file to include the following:

    <init-param>
        <param-name>GEOEXPLORER_DATA</param-name>
        <param-value>/tmp</param-value>
    </init-param>

