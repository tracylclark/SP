//domEngine.js

var domEngine = new (function(){
    var dom = {};
    var get = (f)=>{return document.getElementById(f)};
    this.init = function(){
        dom = {
            overlay:get("overlay"),
            login:{
                container:get("loginContainer"),
                loginButton:get("loginButton"),
                createButton:get("loginCreateButton"),
                username:get("loginUsername"),
                password:get("loginPassword")
            },
            chat:{
                container:get("chatContainer"),
                viewport:get("chatViewport"),
                button:get("chatButton"),
                input:get("chatInput")
            }
        };

        dom.login.loginButton.onclick = ()=>{
            network.login(dom.login.username.value, dom.login.password.value);
        };
        dom.login.createButton.onclick = ()=>{
            network.create(dom.login.username.value, dom.login.password.value);
        };

    }
    this.hideLogin =function(){
        dom.login.container.style.display = "none";
    }
})();
