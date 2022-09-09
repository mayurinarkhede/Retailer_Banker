const transferList = document.querySelector('.transfers');
const form = document.querySelector('#add-transfer');
const toastLiveExample = document.getElementById('liveToast');

// FORM SUBMIT
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let sender_length;
    let sender_name;
    let receiver_length;
    let receiver_name;
    let receiver_current_balance;
    let sender_current_balance;

    // GET data by id of sender
    await db.collection('Customers').where('id', '==', form.sender.value).get().then((snapshot) => {
        sender_length = snapshot.docs.length;
        sender_current_balance = parseInt(snapshot.docs[0].data().balance);
        sender_name = snapshot.docs[0].data().owner;
        console.log(sender_name, sender_current_balance, sender_length);
    }).catch((err) => {
        window.alert('Sender doesnt exist!', err);
        window.location.reload();
    })
    // GET data by id of receiver
    await db.collection('Customers').where('id', '==', form.receiver.value).get().then((snapshot) => {
        receiver_length = snapshot.docs.length;
        receiver_current_balance = parseInt(snapshot.docs[0].data().balance);
        receiver_name = snapshot.docs[0].data().owner;
        console.log(receiver_name, receiver_current_balance, receiver_length);
    }).catch((err) => {
        window.alert('Receiver doesnt exist!', err);
        window.location.reload();
    })

    // riya POST data in firestore Transfers collection
    if (sender_length > 0 && receiver_length > 0 && sender_current_balance > form.amount.value && form.sender.value !== form.receiver.value) {
        await db.collection('Transfers').add({
            sender: form.sender.value,
            senderName: sender_name,
            receiver: form.receiver.value,
            receiverName: receiver_name,
            amount: form.amount.value,
        })

        // update sender
        updateSender(form.sender.value, form.amount.value);
        // update receiver
        updateReceiver(form.receiver.value, form.amount.value);
        // toast message
        var toast = new bootstrap.Toast(toastLiveExample)
        toast.show()
    } else {
        window.alert('Error! in Transaction');
    }

    // clear input data
    form.sender.value = '';
    form.receiver.value = '';
    form.amount.value = '';
    // reload window
    // window.location.reload();
});

// UPDATE SENDER
const updateSender = async (sender, value) => {
    const senderRef = db.collection('Customers').doc(sender);

    try {
        await db.runTransaction(async (t) => {
            const doc = await t.get(senderRef);

            const newBalance = doc.data().balance - Number(value);
            t.update(senderRef, { balance: newBalance });
        });

        console.log('Transaction success!');
    } catch (err) {
        console.log('Transaction failure:', err);
    }
}

// UPDATE RECEIVER
const updateReceiver = async (receiver, value) => {
    const receiverRef = db.collection('Customers').doc(receiver);

    try {
        await db.runTransaction(async (t) => {
            const doc = await t.get(receiverRef);

            const newBalance = doc.data().balance + Number(value);
            t.update(receiverRef, { balance: newBalance });
        });

        console.log('Transaction success!');
    } catch (err) {
        console.log('Transaction failure:', err);
    }
}


// TRANSFER RECORD
const renderTransfers = (transfers) => {
    transfers.forEach((transfer) => {

        let li = document.createElement('li');
        let pill = document.createElement('span');
        let sender = document.createElement('span');
        let receiver = document.createElement('span');
        let amount = document.createElement('span');
        let block = document.createElement('br');

        sender.textContent = `Sender : ${transfer.data().senderName} - ${transfer.data().sender}`;
        sender.className = 'lead';
        pill.textContent = 'Transfered ⚡';
        pill.className = 'rounded-pill movements__type movements__type--deposit';
        receiver.textContent = `Receiver : ${transfer.data().receiverName} - ${transfer.data().receiver}`;
        receiver.className = 'lead';
        amount.textContent = `Amount : ₹${transfer.data().amount}`;
        amount.className = 'lead';

        li.appendChild(sender);
        li.appendChild(pill);
        li.appendChild(receiver);
        receiver.appendChild(block);
        li.appendChild(amount);
        li.className = 'alert alert-secondary';

        transferList.appendChild(li);
        console.log(transfer);
    });
}

// GET transfer record data from firestore(Not REALTIME)
db.collection('Transfers').get().then((snapshot) => {
    renderTransfers(snapshot.docs);
    console.log(snapshot.docs);
})