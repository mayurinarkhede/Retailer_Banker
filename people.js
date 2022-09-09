const customers = document.querySelector('.customers');

const renderCustomers = (accounts) => {

    accounts.forEach((account) => {

        let li = document.createElement('li');
        let name = document.createElement('span');
        let balance = document.createElement('span');
        let id = document.createElement('span');
        let block = document.createElement('br');

        name.textContent = account.data().owner;
        name.className = 'h1';
        balance.textContent = `Balance : ₹${account.data().balance}`;
        balance.className = 'lead';
        id.textContent = `Bank ID : ${account.data().id}`;
        id.className = 'blockquote-footer';

        li.appendChild(name);
        name.appendChild(block);
        li.appendChild(balance);
        li.appendChild(id);
        li.className = 'alert alert-secondary';

        customers.appendChild(li);
    });
}

// GET data from firestore(Not REALTIME)
db.collection('Customers').orderBy("id").get().then((snapshot) => {
    renderCustomers(snapshot.docs);
    console.log(snapshot.docs);
})