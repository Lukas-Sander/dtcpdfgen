const { jsPDF } = window.jspdf;
const reader = new FileReader();
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

document.addEventListener('DOMContentLoaded', () => {
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
        console.log(doc.getFontList());

        doc.deletePage(1);
        let fronts = document.getElementById('fronts').files;
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
            doc.addPage([w, h], 'p');
            doc.setFillColor(c);
            doc.rect(0, 0, w, h, 'F');
            doc.addImage(back, 'JPEG', b, b, w-b*2, h-b*2, '', imgCompression, 0);

            doc.addPage([w, h], 'p');
            doc.setFillColor(c);
            doc.rect(0, 0, w, h, 'F');
            let f = await convertBlobToBase64(fronts.item(x));
            doc.addImage(f, 'JPEG', b, b, w-b*2, h-b*2, x, imgCompression, 0);
            progress.value++;
        }

        doc.save('generated.pdf');

    });
});