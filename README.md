# ZaanAtlas

These instructions describe how to deploy the [ZaanAtlas](https://geo.zaanstad.nl/zaanatlas) assuming you have a copy of the application source code from GitHub.

## Preparation

### Get a copy of the application

To get a copy of the application source code, use git:

    git clone git@github.com:zaanstad/ZaanAtlas.git

### Install Java

The ZaanAtlas repository contains what you need to run the application as a servlet with an integrated persistence layer. Due to its age, the application only runs under Java 1.5. Download the product for your operating system from https://www.oracle.com/java/technologies/java-archive-javase5-downloads.html.

#### Windows

Download the [Windows installer](https://download.oracle.com/otn/java/jdk/1.5.0_22/jdk-1_5_0_22-windows-i586-p.exe) for JDK 1.5 and start the wizard. Accept the *Terms and Conditions* and proceed with the installation.

*For Zaanstad employees, make sure to copy the installation folder `(C:\Program Files (x86)\Java\jdk1.5.0_22`) to the personal U:\-drive as not to lose it*.

Expose the location of the Java executable to the runtime environment:

    setx JAVACMD "U:\Programs\jdk1.5.0_22\bin\java.exe"

#### *nix

On *nix operating systems (assuming the download is available in the `/tmp` folder):

    cd /tmp
    chmod +x jdk-1_5_0_22-linux-amd64.bin
    ./jdk-1_5_0_22-linux-amd64.bin
    sudo mv jdk1.5.0_22 /opt/

    export JDK_INSTALL=/opt/jdk1.5.0_22
    sudo update-alternatives --install /usr/bin/jar jar $JDK_INSTALL/bin/jar 1
    sudo update-alternatives --install /usr/bin/java java $JDK_INSTALL/bin/java 1
    sudo update-alternatives --install /usr/bin/javac javac $JDK_INSTALL/bin/javac 1
    sudo update-alternatives --set jar $JDK_INSTALL/bin/jar
    sudo update-alternatives --set java $JDK_INSTALL/bin/java
    sudo update-alternatives --set javac $JDK_INSTALL/bin/javac
    sudo update-alternatives --config java

Then select Java 1.5 as the version to use.

### Install Ant

To assemble the servlet or run in development mode, you need [Ant](http://ant.apache.org/). Due to the ZaanAtlas being tied to Java 1.5, install Ant version 1.9.x.

#### Windows

Download the [Windows installer](https://mirror.lyrahosting.com/apache//ant/binaries/apache-ant-1.9.15-bin.zip) for Ant 1.9. Unzip the folder and put it with the other programs.

*For Zaanstad employees, make sure to copy the installation folder to the personal U:\-drive as not to lose it*.

Expose the location of the `ant` executable to the runtime environment:

    setx ANT_HOME "U:\Programs\apache-ant-1.9.15"
    setx PATH "%PATH%;%ANT_HOME%\bin"

#### *nix

On *nux operating systems:

    cd /tmp
    wget https://apache.newfountain.nl//ant/binaries/apache-ant-1.9.15-bin.tar.gz
    sudo tar -xf apache-ant-1.9.15-bin.tar.gz -C /opt/

Expose the location of the `ant` executable to the runtime environment:

    export ANT_HOME=/opt/apache-ant-1.9.15
    export PATH=$PATH:$HOME/bin:$ANT_HOME/bin

External dependencies are pulled in from GitHub. To access these dependencies, generate a [Personal Access Token](https://github.com/settings/tokens) (PAT) at GitHub to authenticate.

#### Windows

#### *nix

On *nux operating systems:

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

ZaanAtlas writes to a `geoexplorer.db` when saving maps. The location of this file is determined by the `GEOEXPLORER_DATA` value at runtime. This value can be set as a servlet initialization parameter or a Java system property.

The `GEOEXPLORER_DATA` value must be a path to a directory that is writable by the process that runs the application. The servlet initialization parameter is given precedence over a system property if both exist.

As an example, if you want the `geoexplorer.db` file to be written to your `/tmp` directory, modify GeoExplorer's `web.xml` file to include the following:

    <init-param>
        <param-name>GEOEXPLORER_DATA</param-name>
        <param-value>/tmp</param-value>
    </init-param>

or you can set the location as an environment variable.

On Windows:

    setx "GEOEXPLORER_DATA "C:\temp"

On *nix:

    export GEOEXPLORER_DATA=/tmp

## Preparing the application for deployment

Running the ZaanAtlas as described above is not suitable for production because JavaScript files will be loaded dynamically. Before moving your application to a production environment, run `ant` with the "war" target.  The "war" target will result in a `/build/` directory and a `zaanatlas.war` file that contains all the parts of the web application: Java class files, HTML pages, images, and other resources:

    ant war

Move the `zaanatlas.war` file to your production environment (i.e. the Jetty servlet container).



