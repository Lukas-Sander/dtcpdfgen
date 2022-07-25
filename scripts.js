const { jsPDF } = window.jspdf;
const configInch = {
    19: {   //12" x 18" Small Poster(s) on Deluxe Paper
        w: 12.25,
        h: 18.25,
        b: 0.125
    },
    30: {   //Embossed Tarot Card(s)
        w: 3,
        h: 5,
        b: 0.125
    },
    26: {   //Embossed US Poker Card(s)
        w: 2.75,
        h: 3.75,
        b: 0.125
    },
    33: {   //Premium 11" x 8.5" Landscape GM Screen Insert(s)
        w: 8.75,
        h: 11.25,
        b: 0.125
    },
    4: {    //Premium 6" x 6" Tile Card(s)
        w: 6.25,
        h: 6.25,
        b: 0.125
    },
    7: {    //Premium 8" x 10" Page(s)
        w: 8.25,
        h: 10.25,
        b: 0.125
    },
    8: {    //Premium 8.5" x 11" Page(s)
        w: 8.75,
        h: 11.25,
        b: 0.125
    },
    32: {   //Premium 8.5" x 11" Portrait GM Screen Insert(s)
        w: 8.75,
        h: 11.25,
        b: 0.125
    },
    14: {   //Premium Euro Poker Card(s)
        w: 2.73,
        h: 3.71,
        b: 0.125
    },
    18: {   //Premium Mini-card(s)
        w: 1.875,
        h: 2.75,
        b: 0.125
    },
    25: {   //Premium Tarot Card(s)
        w: 3,
        h: 5,
        b: 0.125
    },
    3: {    //Premium US Poker Card(s)
        w: 2.75,
        h: 3.75,
        b: 0.125
    },
};

const convertBlobToBase64 = async (blob) => {
    return await blobToBase64(blob);
}

const blobToBase64 = blob => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});


function previewImage(source, target) {
    if(source != undefined) {
        target.src = URL.createObjectURL(source);
    }
    else {
        target.removeAttribute('src');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const fronts = document.getElementById('fronts');
    const back = document.getElementById('back');
    const tpl = document.getElementById('templateCardRow');
    const table = document.getElementById('cardsTable');
    // const progress = document.getElementById('progress');
    const cardsTotal = document.getElementById('cardsTotal');
    // let cards = 0;
    // const w = parseFloat(document.getElementById('width'));
    // const h = parseFloat(document.getElementById('height'));
    // const b = parseFloat(document.getElementById('bleeding'));
    // const c = document.getElementById('color');

    function updateCardNumber() {
        let number = 0;
        document.querySelectorAll('#cardsTable .copies').forEach((e) => {
            number += parseInt(e.value);
        });

        cardsTotal.innerText = number;
    }

    function addCardRow(file) {
        let t = tpl.content.cloneNode(true);
        let frontInput = t.querySelector('.front');
        let backInput = t.querySelector('.back');
        let frontPreview = t.querySelector('.front-preview');
        let backPreview = t.querySelector('.back-preview');

        let dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        frontInput.files = dataTransfer.files;
        previewImage(dataTransfer.files[0], frontPreview);

        backInput.files = back.files;
        previewImage(back.files[0], backPreview);


        frontInput.addEventListener('change', (e) => {
            previewImage(e.target.files[0], frontPreview);
        });

        backInput.addEventListener('change', (e) => {
            previewImage(e.target.files[0], backPreview);
            e.target.dataset.custom = '1';
        });

        t.querySelector('.back-reset').addEventListener('click', () => {
            backInput.dataset.custom = '0';
            backInput.files = back.files;
            previewImage(back.files[0], backPreview);
        });

        t.querySelector('.copies').addEventListener('input', (e) => {
            updateCardNumber();
        });

        t.querySelector('.delete-card').addEventListener('click', (e) => {
            if(confirm('delete this card?')){
                cardsTotal.innerText = parseInt(cardsTotal.innerText) - parseInt(e.target.closest('tr').querySelector('.copies').value);
                e.target.closest('tr').remove();
            }
        });

        table.appendChild(t);
        cardsTotal.innerText++;
    }


    const backPreview = document.getElementById('cardBack');
    back.addEventListener('change', () => {
        previewImage(back.files[0], backPreview);
    });

    document.getElementById('addCardFronts').addEventListener('click', () => {
        for(let x of fronts.files) {
            addCardRow(x);
        }
        fronts.value = '';
    });

    document.getElementById('removeAllCards').addEventListener('click', () => {
        if(confirm('do you really want to delete all cards?')) {
            table.innerHTML = '';
            cardsTotal.innerText = '0';
        }
    });

    document.getElementById('updateCardBacks').addEventListener('click', () => {
        document.querySelectorAll('#cardsTable .td-card-back').forEach((e) => {
            let img = e.querySelector('.back-preview');
            let file = e.querySelector('.back');
            if(file.dataset.custom === '0') {
                file.files = back.files;
                previewImage(file.files[0], img);
            }
        });
    });

    document.getElementById('toggleImprint').addEventListener('click', () => {
        let d = document.getElementById('imprint').style.display;
        document.getElementById('imprint').style.display = d=='none' ? 'block' : 'none';
    });
    document.getElementById('togglePP').addEventListener('click', () => {
        let d = document.getElementById('PP').style.display;
        document.getElementById('PP').style.display = d=='none' ? 'block' : 'none';
    });

    let w = document.getElementById('width');
    let h = document.getElementById('height');
    let b = document.getElementById('bleeding');
    let presets = document.getElementById('card_type_select');
    document.getElementById('usePreset').addEventListener('click', () => {
        w.value = configInch[presets.value].w;
        h.value = configInch[presets.value].h;
        b.value = configInch[presets.value].b;
    });

    document.getElementById('cardForm').addEventListener('submit', async (e) => {
        e.stopPropagation();
        e.preventDefault();

        let doc = new jsPDF({
            orientation: 'p',
            unit: 'in',
            compress: document.getElementById('compress').checked,
            putOnlyUsedFonts: true
        });

        doc.deletePage(1);
        // let fronts = document.getElementById('fronts').files;
        let fronts = document.querySelectorAll('#cardsTable tr');
        let back = document.getElementById('back').files[0];
        let progress = document.getElementById('progress');
        let w = parseFloat(document.getElementById('width').value);
        let h = parseFloat(document.getElementById('height').value);
        let b = parseFloat(document.getElementById('bleeding').value);
        let c = document.getElementById('color').value;
        let imgCompression = document.getElementById('img_compress').value;

        progress.max = fronts.length;
        progress.value = 0;

        back = await convertBlobToBase64(back);

        for(let x = 0; x < fronts.length; x++) {
            let frontImg = fronts[x].querySelector('.front').files[0];
            let backImg = fronts[x].querySelector('.back').files[0];
            let bck = fronts[x].querySelector('.back');
            let backName = x + 'b';

            if(bck.dataset.custom === '0') {
                backImg = back;
                backName = 'bd'
            }
            else {
                backImg = await convertBlobToBase64(backImg);
            }

            let cp = fronts[x].querySelector('.copies').value;

            for(let i = 1; i <= cp; i++) {
                doc.addPage([w, h], 'p');
                doc.setFillColor(c);
                doc.rect(0, 0, w, h, 'F');
                doc.addImage(backImg, 'JPEG', b, b, w-b*2, h-b*2, backName, imgCompression, 0);

                doc.addPage([w, h], 'p');
                doc.setFillColor(c);
                doc.rect(0, 0, w, h, 'F');
                let f = await convertBlobToBase64(frontImg);
                doc.addImage(f, 'JPEG', b, b, w-b*2, h-b*2, x, imgCompression, 0);
                progress.value++;
            }

        }

        doc.save('generated.pdf');

    });
});