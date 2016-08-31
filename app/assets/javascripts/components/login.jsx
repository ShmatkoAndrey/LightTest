var Login = React.createClass({
    FBlogin() {
        FB.init({
            appId: '1997533793805209',
            version: 'v2.5'
        });
        FB.getLoginStatus(function (response) {
            if (response.status === 'connected') login();
            else FB.login(function () { login(); }, { scope: 'public_profile' });
        });
        this_ = this; // Через .bind(this) не вариант =\
        function login() {
            FB.api('/me', {fields: 'name'}, function (response) {
                $.ajax({
                    type: 'POST',
                    url: '../sessions/social_auth',
                    data: {social: response, provider: 'facebook'},
                    success: function (data) {
                        if (data.error) console.log(data.error);
                        else this_.props.changeCurrentUser(data.current_user)
                    }
                });
            });
        }
    },
    render() {
        return (
            <div id="login">
                <div id = "fb-login" onClick = { this.FBlogin } ></div>
                <div id = "guest-login" onClick = { () => { this.props.changeCurrentUser('guest') } } ></div>
            </div>
        )
    }
});