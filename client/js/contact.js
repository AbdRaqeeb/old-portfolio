// Form Constructor
class Form {
    constructor(name, email, subject, message) {
        this.name = name;
        this.email = email;
        this.subject = subject;
        this.message = message;
    }

    static clearFields() {
        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
        document.getElementById('subject').value = '';
        document.getElementById('message').value = '';
    }
}

document.getElementById('contact-form').addEventListener('submit', (e) => {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    const form = new Form(name, email, subject, message);

    // noinspection JSIgnoredPromiseFromCall
    sendMessage(form);
    e.preventDefault();
});

const sendMessage = async (form) => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    try {
        const res = await axios.post('/email', form, config);
        const msg = res.data.msg;
        Snackbar.show({text: msg});
        Form.clearFields();
    } catch (err) {
        console.log(err.response.data);
        const data = err.response.data;
        Snackbar.show({ text: data });
        Form.clearFields();
    }
};