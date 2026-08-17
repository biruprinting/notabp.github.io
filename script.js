document.addEventListener("DOMContentLoaded", () => {

    // =========================================================
    // ELEMENT
    // =========================================================

    const navItems = document.querySelectorAll(".nav-item");
    const pages = document.querySelectorAll(".page");

    const tanggalInput =
        document.getElementById("tanggal");

    const namaPelangganInput =
        document.getElementById("namaPelanggan");

    const customerSuggestions =
        document.getElementById("customerSuggestions");

    const itemsContainer =
        document.getElementById("itemsContainer");

    const btnTambahItem =
        document.getElementById("btnTambahItem");

    const itemCount =
        document.getElementById("itemCount");

    const subtotalElement =
        document.getElementById("subtotal");

    const diskonInput =
        document.getElementById("diskon");

    const totalBayarElement =
        document.getElementById("totalBayar");

    const uangDiterimaInput =
        document.getElementById("uangDiterima");

    const paymentLabel =
        document.getElementById("paymentLabel");

    const paymentValue =
        document.getElementById("paymentValue");

    const nomorNotaElement =
        document.getElementById("nomorNota");

    const btnSimpan =
        document.getElementById("btnSimpan");
    
    const btnPreview =
        document.getElementById("btnPreview");

    const btnNotaBaru =
        document.getElementById("btnNotaBaru");

    const previewModal =
        document.getElementById("previewModal");

    const notaPreview =
        document.getElementById("notaPreview");

    const btnClosePreview =
        document.getElementById("btnClosePreview");

    const btnClosePreview2 =
        document.getElementById("btnClosePreview2");
    
    const btnDownloadPNG =
        document.getElementById("btnDownloadPNG");
    
    const btnCopyNota =
        document.getElementById("btnCopyNota");

    const riwayatContainer =
        document.getElementById("riwayatContainer");

    const searchRiwayat =
        document.getElementById("searchRiwayat");

    const btnExport =
        document.getElementById("btnExport");

    const btnImport =
        document.getElementById("btnImport");

    const importFile =
        document.getElementById("importFile");


    // =========================================================
    // STORAGE KEY
    // =========================================================

    const STORAGE_KEY =
        "biruPrinting_notaData";

    const DRAFT_KEY =
        "biruPrinting_draftNota";


    // =========================================================
    // DATA
    // =========================================================

    let notaData = [];

    let currentNotaId = null;


    // =========================================================
    // HELPER
    // =========================================================

    function formatRupiah(number) {

        number = Number(number) || 0;

        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }).format(number);

    }


    function generateId() {

        return Date.now().toString() +
            Math.random()
                .toString(36)
                .substring(2, 8);

    }


    function escapeHTML(value) {

        if (!value) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // =========================================================
    // LOCAL STORAGE
    // =========================================================

    function loadData() {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            notaData = [];
            return;
        }

        try {

            notaData =
                JSON.parse(saved);

            if (!Array.isArray(notaData)) {
                notaData = [];
            }

        } catch (error) {

            console.error(
                "Gagal membaca data nota:",
                error
            );

            notaData = [];

        }

    }


    function saveData() {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(notaData)
        );

    }


    // =========================================================
    // DRAFT
    // =========================================================

    function saveDraft() {

        const draft = {
            tanggal:
                tanggalInput.value,

            pelanggan:
                namaPelangganInput.value,

            nomorNota:
                nomorNotaElement.textContent,

            diskon:
                Number(
                    diskonInput.value
                ) || 0,

            uangDiterima:
                Number(
                    uangDiterimaInput.value
                ) || 0,

            items:
                getItemsFromForm(),

            currentNotaId
        };


        localStorage.setItem(
            DRAFT_KEY,
            JSON.stringify(draft)
        );

    }


    function loadDraft() {

        const saved =
            localStorage.getItem(
                DRAFT_KEY
            );


        if (!saved) {
            return false;
        }


        try {

            const draft =
                JSON.parse(saved);


            if (!draft) {
                return false;
            }


            tanggalInput.value =
                draft.tanggal || tanggalHariIni();


            namaPelangganInput.value =
                draft.pelanggan || "";


            nomorNotaElement.textContent =
                draft.nomorNota ||
                generateNomorNota();


            diskonInput.value =
                draft.diskon || 0;


            uangDiterimaInput.value =
                draft.uangDiterima || 0;


            currentNotaId =
                draft.currentNotaId || null;


            itemsContainer.innerHTML = "";


            if (
                Array.isArray(draft.items) &&
                draft.items.length > 0
            ) {

                draft.items.forEach(
                    item => {

                        tambahItem(item);

                    }
                );

            } else {

                tambahItem();

            }


            hitungTotal();


            return true;

        } catch (error) {

            console.error(
                "Gagal memulihkan draft:",
                error
            );

            return false;

        }

    }


    function clearDraft() {

        localStorage.removeItem(
            DRAFT_KEY
        );

    }


    // =========================================================
    // TANGGAL
    // =========================================================

    function tanggalHariIni() {

        const today =
            new Date();

        const year =
            today.getFullYear();

        const month =
            String(
                today.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                today.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;

    }


    function setTanggalHariIni() {

        tanggalInput.value =
            tanggalHariIni();

    }


    // =========================================================
    // NOMOR NOTA
    // =========================================================

    function generateNomorNota() {

        const date =
            new Date();

        const year =
            String(
                date.getFullYear()
            ).slice(-2);

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");


        const random =
            Math.floor(
                100 + Math.random() * 900
            );


        return `BP${day}${month}${year}-${random}`;

    }


    // =========================================================
    // NAVIGASI
    // =========================================================

    navItems.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const target =
                    button.dataset.page;


                navItems.forEach(item => {
                    item.classList.remove(
                        "active"
                    );
                });


                pages.forEach(page => {
                    page.classList.remove(
                        "active"
                    );
                });


                button.classList.add(
                    "active"
                );


                document
                    .getElementById(
                        `page-${target}`
                    )
                    .classList.add(
                        "active"
                    );


                if (
                    target === "riwayat"
                ) {

                    renderRiwayat();

                }


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    });


    // =========================================================
    // ITEM
    // =========================================================

    function tambahItem(data = null) {

        const itemNumber =
            itemsContainer.children.length + 1;


        const item =
            document.createElement("div");


        item.className =
            "item-card";


        item.innerHTML = `

            <div class="item-header">

                <strong>
                    Item ${itemNumber}
                </strong>

                <button
                    type="button"
                    class="btn-delete"
                    title="Hapus item"
                >
                    🗑️
                </button>

            </div>


            <div class="item-grid">

                <div class="form-group item-name">

                    <label>
                        Nama Item
                    </label>

                    <input
                        type="text"
                        class="item-nama"
                        placeholder="Contoh: Undangan KH-01"
                        value="${escapeHTML(
                            data?.nama || ""
                        )}"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Jumlah
                    </label>

                    <input
                        type="number"
                        class="item-jumlah"
                        min="1"
                        value="${data?.jumlah || 1}"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Harga Satuan
                    </label>

                    <input
                        type="number"
                        class="item-harga"
                        min="0"
                        value="${data?.harga || 0}"
                    >

                </div>

            </div>


            <div class="item-subtotal">

                <span>
                    Subtotal
                </span>

                <strong
                    class="item-subtotal-value"
                >
                    Rp 0
                </strong>

            </div>

        `;


        // =========================
        // HAPUS ITEM
        // =========================

        const btnDelete =
            item.querySelector(
                ".btn-delete"
            );


        btnDelete.addEventListener(
            "click",
            () => {

                if (
                    itemsContainer
                        .children.length <= 1
                ) {

                    showToast(
                        "Minimal harus ada 1 item."
                    );

                    return;

                }


                item.remove();

                updateItemNumbers();

                hitungTotal();

                saveDraft();

            }
        );


        // =========================
        // INPUT
        // =========================

        const namaInput =
            item.querySelector(
                ".item-nama"
            );

        const jumlahInput =
            item.querySelector(
                ".item-jumlah"
            );

        const hargaInput =
            item.querySelector(
                ".item-harga"
            );


        namaInput.addEventListener(
            "input",
            () => {

                hitungTotal();
                saveDraft();

            }
        );


        jumlahInput.addEventListener(
            "input",
            () => {

                hitungSubtotalItem(item);
                hitungTotal();
                saveDraft();

            }
        );


        hargaInput.addEventListener(
            "input",
            () => {

                hitungSubtotalItem(item);
                hitungTotal();
                saveDraft();

            }
        );


        itemsContainer.appendChild(
            item
        );


        hitungSubtotalItem(
            item
        );


        updateItemNumbers();

        hitungTotal();

    }


    function updateItemNumbers() {

        const items =
            itemsContainer.querySelectorAll(
                ".item-card"
            );


        items.forEach(
            (item, index) => {

                item.querySelector(
                    ".item-header strong"
                ).textContent =
                    `Item ${index + 1}`;

            }
        );


        itemCount.textContent =
            `${items.length} Item`;

    }


    function hitungSubtotalItem(item) {

        const jumlah =
            Number(
                item.querySelector(
                    ".item-jumlah"
                ).value
            ) || 0;


        const harga =
            Number(
                item.querySelector(
                    ".item-harga"
                ).value
            ) || 0;


        const subtotal =
            jumlah * harga;


        item.querySelector(
            ".item-subtotal-value"
        ).textContent =
            formatRupiah(
                subtotal
            );

    }


    function getItemsFromForm() {

        const items = [];


        const itemElements =
            itemsContainer.querySelectorAll(
                ".item-card"
            );


        itemElements.forEach(item => {

            const nama =
                item.querySelector(
                    ".item-nama"
                ).value.trim();


            const jumlah =
                Number(
                    item.querySelector(
                        ".item-jumlah"
                    ).value
                ) || 0;


            const harga =
                Number(
                    item.querySelector(
                        ".item-harga"
                    ).value
                ) || 0;


            items.push({

                nama,

                jumlah,

                harga,

                subtotal:
                    jumlah * harga

            });

        });


        return items;

    }


    // =========================================================
    // TOTAL
    // =========================================================

    function hitungTotal() {

        let subtotal = 0;


        const items =
            getItemsFromForm();


        items.forEach(item => {

            subtotal +=
                item.subtotal;

        });


        const diskon =
            Number(
                diskonInput.value
            ) || 0;


        const total =
            Math.max(
                subtotal - diskon,
                0
            );


        const uangDiterima =
            Number(
                uangDiterimaInput.value
            ) || 0;


        subtotalElement.textContent =
            formatRupiah(
                subtotal
            );


        totalBayarElement.textContent =
            formatRupiah(
                total
            );


        const selisih =
            uangDiterima - total;


        if (selisih >= 0) {

            paymentLabel.textContent =
                "Kembalian";


            paymentValue.textContent =
                formatRupiah(
                    selisih
                );


            paymentValue.style.color =
                "var(--success)";

        } else {

            paymentLabel.textContent =
                "Kekurangan";


            paymentValue.textContent =
                formatRupiah(
                    Math.abs(selisih)
                );


            paymentValue.style.color =
                "var(--danger)";

        }

    }


    // =========================================================
    // AMBIL DATA NOTA
    // =========================================================

    function getFormData() {

        const items =
            getItemsFromForm();


        const subtotal =
            items.reduce(
                (total, item) =>
                    total + item.subtotal,
                0
            );


        const diskon =
            Number(
                diskonInput.value
            ) || 0;


        const total =
            Math.max(
                subtotal - diskon,
                0
            );


        const uangDiterima =
            Number(
                uangDiterimaInput.value
            ) || 0;


        return {

            id:
                currentNotaId ||
                generateId(),

            nomorNota:
                nomorNotaElement.textContent,

            tanggal:
                tanggalInput.value,

            pelanggan:
                namaPelangganInput.value.trim(),

            items,

            subtotal,

            diskon,

            total,

            uangDiterima,

            selisih:
                uangDiterima - total,

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        };

    }


    // =========================================================
    // VALIDASI
    // =========================================================

    function validateForm(data) {

        if (!data.pelanggan) {

            showToast(
                "Nama pelanggan belum diisi."
            );

            namaPelangganInput.focus();

            return false;

        }


        const itemValid =
            data.items.some(
                item =>
                    item.nama &&
                    item.jumlah > 0 &&
                    item.harga >= 0
            );


        if (!itemValid) {

            showToast(
                "Minimal isi satu item pesanan."
            );

            return false;

        }


        return true;

    }


    // =========================================================
    // SIMPAN NOTA
    // =========================================================

    btnSimpan.addEventListener(
        "click",
        () => {

            const data =
                getFormData();


            if (!validateForm(data)) {
                return;
            }


            const existingIndex =
                notaData.findIndex(
                    nota =>
                        nota.id ===
                        data.id
                );


            if (
                existingIndex !== -1
            ) {

                notaData[
                    existingIndex
                ] = {

                    ...data,

                    createdAt:
                        notaData[
                            existingIndex
                        ].createdAt

                };

            } else {

                notaData.unshift(
                    data
                );

            }


            saveData();
            
            showToast(
                "Nota berhasil disimpan."
            );


            currentNotaId =
                data.id;


            clearDraft();


            renderRiwayat();




        }
    );


    // =========================================================
    // RIWAYAT
    // =========================================================

    function renderRiwayat(
        keyword = ""
    ) {

        const search =
            keyword
                .trim()
                .toLowerCase();


        const filtered =
            notaData.filter(nota => {

                const nomor =
                    String(
                        nota.nomorNota || ""
                    ).toLowerCase();


                const pelanggan =
                    String(
                        nota.pelanggan || ""
                    ).toLowerCase();


                return (
                    nomor.includes(search) ||
                    pelanggan.includes(search)
                );

            });


        if (
            filtered.length === 0
        ) {

            riwayatContainer.innerHTML = `

                <div class="empty-state">

                    <div>📋</div>

                    <h3>
                        Belum ada nota
                    </h3>

                    <p>
                        Nota yang disimpan
                        akan muncul di sini.
                    </p>

                </div>

            `;

            return;

        }


        riwayatContainer.innerHTML =
            filtered.map(nota => {

                return `

                    <div
                        class="history-item"
                    >

                        <div
                            class="history-info"
                        >

                            <h4>
                                ${escapeHTML(
                                    nota.pelanggan
                                )}
                            </h4>

                            <p>
                                ${escapeHTML(
                                    nota.nomorNota
                                )}
                                ·
                                ${formatTanggal(
                                    nota.tanggal
                                )}
                            </p>

                        </div>


                        <div>

                            <div
                                class="history-total"
                            >
                                ${formatRupiah(
                                    nota.total
                                )}
                            </div>


                            <div
                                class="history-actions"
                            >

                                <button
                                    class="btn btn-outline btn-edit"
                                    data-id="${nota.id}"
                                >
                                    Edit
                                </button>


                                <button
                                    class="btn btn-outline btn-duplicate"
                                    data-id="${nota.id}"
                                >
                                    Duplikat
                                </button>


                                <button
                                    class="btn btn-outline btn-delete-history"
                                    data-id="${nota.id}"
                                >
                                    Hapus
                                </button>

                            </div>

                        </div>

                    </div>

                `;

            }).join("");


        // EDIT

        document
            .querySelectorAll(
                ".btn-edit"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        editNota(
                            button.dataset.id
                        );

                    }
                );

            });


        // DUPLIKAT

        document
            .querySelectorAll(
                ".btn-duplicate"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        duplicateNota(
                            button.dataset.id
                        );

                    }
                );

            });


        // HAPUS

        document
            .querySelectorAll(
                ".btn-delete-history"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteNota(
                            button.dataset.id
                        );

                    }
                );

            });

    }


    // =========================================================
    // FORMAT TANGGAL
    // =========================================================

    function formatTanggal(
        tanggal
    ) {

        if (!tanggal) {
            return "-";
        }


        const date =
            new Date(
                tanggal + "T00:00:00"
            );


        return date.toLocaleDateString(
            "id-ID",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    }


    // =========================================================
    // EDIT
    // =========================================================

    function editNota(id) {

        const nota =
            notaData.find(
                item => item.id === id
            );


        if (!nota) {
            return;
        }


        currentNotaId =
            nota.id;


        tanggalInput.value =
            nota.tanggal;


        namaPelangganInput.value =
            nota.pelanggan;


        nomorNotaElement.textContent =
            nota.nomorNota;


        diskonInput.value =
            nota.diskon;


        uangDiterimaInput.value =
            nota.uangDiterima;


        itemsContainer.innerHTML =
            "";


        nota.items.forEach(
            item => {

                tambahItem(item);

            }
        );


        hitungTotal();

        saveDraft();


        document
            .querySelector(
                '[data-page="buat"]'
            )
            .click();

    }


    // =========================================================
    // DUPLIKAT
    // =========================================================

    function duplicateNota(id) {

        const nota =
            notaData.find(
                item => item.id === id
            );


        if (!nota) {
            return;
        }


        currentNotaId = null;


        setTanggalHariIni();


        nomorNotaElement.textContent =
            generateNomorNota();


        namaPelangganInput.value =
            nota.pelanggan;


        diskonInput.value =
            nota.diskon;


        uangDiterimaInput.value =
            0;


        itemsContainer.innerHTML =
            "";


        nota.items.forEach(
            item => {

                tambahItem({
                    nama: item.nama,
                    jumlah: item.jumlah,
                    harga: item.harga
                });

            }
        );


        hitungTotal();

        saveDraft();


        document
            .querySelector(
                '[data-page="buat"]'
            )
            .click();

    }


    // =========================================================
    // HAPUS
    // =========================================================

    function deleteNota(id) {

        const nota =
            notaData.find(
                item => item.id === id
            );


        if (!nota) {
            return;
        }


        const yakin =
            confirm(
                `Hapus nota ${nota.nomorNota}?`
            );


        if (!yakin) {
            return;
        }


        notaData =
            notaData.filter(
                item => item.id !== id
            );


        saveData();

        renderRiwayat();

    }


    // =========================================================
    // SEARCH RIWAYAT
    // =========================================================

    searchRiwayat.addEventListener(
        "input",
        () => {

            renderRiwayat(
                searchRiwayat.value
            );

        }
    );


    // =========================================================
    // AUTOCOMPLETE PELANGGAN
    // =========================================================

    namaPelangganInput.addEventListener(
        "input",
        () => {

            hitungTotal();

            saveDraft();

            tampilkanSaranPelanggan();

        }
    );


    function getCustomerNames() {

        const names =
            notaData
                .map(
                    nota =>
                        nota.pelanggan
                )
                .filter(Boolean);


        return [
            ...new Set(names)
        ];

    }


    function tampilkanSaranPelanggan() {

        const keyword =
            namaPelangganInput.value
                .trim()
                .toLowerCase();


        customerSuggestions.innerHTML =
            "";


        if (!keyword) {
            return;
        }


        const matches =
            getCustomerNames()
                .filter(
                    name =>
                        name
                            .toLowerCase()
                            .includes(
                                keyword
                            )
                )
                .slice(0, 6);


        if (
            matches.length === 0
        ) {
            return;
        }


        matches.forEach(name => {

            const suggestion =
                document.createElement(
                    "div"
                );


            suggestion.className =
                "suggestion";


            suggestion.textContent =
                name;


            suggestion.addEventListener(
                "click",
                () => {

                    namaPelangganInput.value =
                        name;


                    customerSuggestions
                        .innerHTML =
                        "";


                    saveDraft();

                }
            );


            customerSuggestions
                .appendChild(
                    suggestion
                );

        });

    }


    document.addEventListener(
        "click",
        event => {

            if (
                !event.target.closest(
                    "#namaPelanggan"
                ) &&
                !event.target.closest(
                    "#customerSuggestions"
                )
            ) {

                customerSuggestions
                    .innerHTML =
                    "";

            }

        }
    );


    // =========================================================
    // EXPORT JSON
    // =========================================================

    btnExport.addEventListener(
        "click",
        () => {

            if (
                notaData.length === 0
            ) {

                showToast(
                    "Belum ada data nota untuk diekspor."
                );

                return;

            }


            const backup = {

                app:
                    "Biru Printing Nota Generator",

                version:
                    1,

                exportedAt:
                    new Date().toISOString(),

                notes:
                    notaData

            };


            const json =
                JSON.stringify(
                    backup,
                    null,
                    2
                );


            const blob =
                new Blob(
                    [json],
                    {
                        type:
                            "application/json"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            const tanggal =
                new Date()
                    .toISOString()
                    .slice(0, 10);


            link.href = url;

            link.download =
                `backup-nota-biru-printing-${tanggal}.json`;


            document.body.appendChild(
                link
            );


            link.click();

            link.remove();

            URL.revokeObjectURL(
                url
            );

        }
    );


    // =========================================================
    // IMPORT JSON
    // =========================================================

    btnImport.addEventListener(
        "click",
        () => {

            importFile.click();

        }
    );


    importFile.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];


            if (!file) {
                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function () {

                    try {

                        const backup =
                            JSON.parse(
                                reader.result
                            );


                        if (
                            !backup.notes ||
                            !Array.isArray(
                                backup.notes
                            )
                        ) {

                            throw new Error(
                                "Format backup tidak valid."
                            );

                        }


                        const yakin =
                            confirm(
                                `Import ${backup.notes.length} nota? Data dengan nomor nota yang sama akan diperbarui.`
                            );


                        if (!yakin) {
                            return;
                        }


                        let added = 0;

                        let updated = 0;


                        backup.notes.forEach(
                            importedNota => {

                                const index =
                                    notaData.findIndex(
                                        nota =>
                                            nota.nomorNota ===
                                            importedNota.nomorNota
                                    );


                                if (
                                    index !== -1
                                ) {

                                    notaData[index] =
                                        importedNota;

                                    updated++;

                                } else {

                                    notaData.unshift(
                                        importedNota
                                    );

                                    added++;

                                }

                            }
                        );


                        saveData();

                        renderRiwayat();


                        showToast(
                            `Import berhasil.\n\nNota baru: ${added}\nDiperbarui: ${updated}`
                        );


                    } catch (error) {

                        console.error(
                            error
                        );


                        showToast(
                            "File backup tidak valid atau rusak."
                        );

                    }


                    importFile.value =
                        "";

                };


            reader.readAsText(
                file
            );

        }
    );


    // =========================================================
    // EVENT FORM LAIN
    // =========================================================

    tanggalInput.addEventListener(
        "change",
        saveDraft
    );


    diskonInput.addEventListener(
        "input",
        () => {

            hitungTotal();

            saveDraft();

        }
    );


    uangDiterimaInput.addEventListener(
        "input",
        () => {

            hitungTotal();

            saveDraft();

        }
    );


    btnTambahItem.addEventListener(
        "click",
        () => {

            tambahItem();

            saveDraft();

        }
    );

// =========================================================
// PREVIEW NOTA
// =========================================================

function tampilkanPreview() {

    const data =
        getFormData();


    if (!validateForm(data)) {
        return;
    }


    let rows = "";


    data.items.forEach(
        (item, index) => {

            rows += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHTML(
                            item.nama
                        )}
                    </td>

                    <td class="text-right">
                        ${item.jumlah}
                    </td>

                    <td class="text-right">
                        ${formatRupiah(
                            item.harga
                        )}
                    </td>

                    <td class="text-right">
                        ${formatRupiah(
                            item.subtotal
                        )}
                    </td>

                </tr>

            `;

        }
    );


    const paymentLabelText =
        data.selisih >= 0
            ? "Kembalian"
            : "Kekurangan";


    const paymentAmount =
        Math.abs(
            data.selisih
        );


    notaPreview.innerHTML = `

        <div class="nota-paper">

            <div class="nota-brand">

                <h1>
                    ${escapeHTML(
                        getSettings().namaUsaha
                    )}
                </h1>

                <p>
                    ${escapeHTML(
                        getSettings().deskripsiUsaha
                    )}
                </p>

                <p>
                    ${escapeHTML(
                        getSettings().nomorWhatsApp
                    )}
                </p>

            </div>


            <div class="nota-info">

                <div class="nota-info-row">

                    <strong>
                        No. Nota
                    </strong>

                    <span>
                        ${escapeHTML(
                            data.nomorNota
                        )}
                    </span>

                </div>


                <div class="nota-info-row">

                    <strong>
                        Tanggal
                    </strong>

                    <span>
                        ${formatTanggal(
                            data.tanggal
                        )}
                    </span>

                </div>


                <div class="nota-info-row">

                    <strong>
                        Pelanggan
                    </strong>

                    <span>
                        ${escapeHTML(
                            data.pelanggan
                        )}
                    </span>

                </div>

            </div>


            <table class="nota-table">

                <thead>

                    <tr>

                        <th>
                            #
                        </th>

                        <th>
                            Item
                        </th>

                        <th class="text-right">
                            Qty
                        </th>

                        <th class="text-right">
                            Harga
                        </th>

                        <th class="text-right">
                            Subtotal
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${rows}

                </tbody>

            </table>


            <div class="nota-total">

                <div class="nota-total-row">

                    <span>
                        Subtotal
                    </span>

                    <strong>
                        ${formatRupiah(
                            data.subtotal
                        )}
                    </strong>

                </div>


                <div class="nota-total-row">

                    <span>
                        Diskon
                    </span>

                    <strong>
                        ${formatRupiah(
                            data.diskon
                        )}
                    </strong>

                </div>


                <div
                    class="nota-total-row nota-total-final"
                >

                    <span>
                        TOTAL BAYAR
                    </span>

                    <strong>
                        ${formatRupiah(
                            data.total
                        )}
                    </strong>

                </div>


                <div class="nota-payment">

                    <div
                        class="nota-total-row"
                    >

                        <span>
                            Uang Diterima
                        </span>

                        <strong>
                            ${formatRupiah(
                                data.uangDiterima
                            )}
                        </strong>

                    </div>


                    <div
                        class="nota-total-row"
                    >

                        <span>
                            ${paymentLabelText}
                        </span>

                        <strong>
                            ${formatRupiah(
                                paymentAmount
                            )}
                        </strong>

                    </div>

                </div>

            </div>


            <div class="nota-footer">

                ${escapeHTML(
                    getSettings().footerNota
                )}

            </div>

        </div>

    `;


    previewModal.classList.add(
        "show"
    );

}


function tutupPreview() {

    previewModal.classList.remove(
        "show"
    );

}

// =========================================================
// NOTA BARU / RESET FORM
// =========================================================

function buatNotaBaru() {

    const yakin =
        confirm(
            "Kosongkan semua isian dan membuat nota baru?"
        );

    if (!yakin) {
        return;
    }


    // Reset form utama
    if (typeof form !== "undefined" && form) {
        form.reset();
    }


    // Hapus semua item
    const itemsContainer =
        document.getElementById(
            "itemsContainer"
        );

    if (itemsContainer) {

        itemsContainer.innerHTML = "";

    }


    // Tambahkan 1 item kosong
    if (
        typeof tambahItem === "function"
    ) {

        tambahItem();

    }


    // Reset diskon dan uang diterima
    const diskon =
        document.getElementById("diskon");

    const uangDiterima =
        document.getElementById(
            "uangDiterima"
        );

    if (diskon) {
        diskon.value = 0;
    }

    if (uangDiterima) {
        uangDiterima.value = 0;
    }


    // Buat nomor nota baru
    if (
        typeof generateNomorNota ===
        "function"
    ) {

        generateNomorNota();

    }


    // Hitung ulang
    if (
        typeof hitungTotal ===
        "function"
    ) {

        hitungTotal();

    }


    // Fokus ke nama pelanggan
    const pelanggan =
        document.getElementById(
            "pelanggan"
        );

    if (pelanggan) {

        pelanggan.focus();

    }


    showToast(
        "Nota baru siap dibuat."
    );

}

if (btnNotaBaru) {

    btnNotaBaru.addEventListener(
        "click",
        buatNotaBaru
    );

}

// =========================================================
// EXPORT PNG
// =========================================================

async function downloadNotaPNG() {

    console.log("Tombol PNG diklik");


    if (
        typeof html2canvas === "undefined"
    ) {

        showToast(
            "Library pembuat gambar belum berhasil dimuat."
        );

        return;

    }


    const paper =
        document.querySelector(
            ".nota-paper"
        );


    if (!paper) {

        showToast(
            "Nota belum tersedia. Silakan buka Preview Nota terlebih dahulu."
        );

        return;

    }


    const originalText =
        btnDownloadPNG.innerHTML;


    btnDownloadPNG.disabled = true;

    btnDownloadPNG.innerHTML =
        "⏳ Membuat PNG...";


    try {

        const canvas =
            await html2canvas(
                paper,
                {
                    scale: 3,

                    backgroundColor:
                        "#ffffff",

                    useCORS: true,

                    allowTaint: false,

                    logging: false
                }
            );


        const nomor =
            nomorNotaElement
                .textContent
                .trim()
                .replace(
                    /[^a-zA-Z0-9-_]/g,
                    "-"
                );


        canvas.toBlob(
            function(blob) {

                if (!blob) {

                    showToast(
                        "Gagal membuat file PNG."
                    );

                    return;

                }


                const url =
                    URL.createObjectURL(
                        blob
                    );


                const link =
                    document.createElement(
                        "a"
                    );


                link.href = url;

                link.download =
                    `Nota-${nomor}.png`;


                document.body.appendChild(
                    link
                );


                link.click();


                link.remove();


                setTimeout(
                    () => {

                        URL.revokeObjectURL(
                            url
                        );

                    },
                    1000
                );


            },
            "image/png"
        );


    } catch (error) {

        console.error(
            "ERROR EXPORT PNG:",
            error
        );


        showToast(
            "Gagal membuat PNG.\n\n" +
            error.message
        );

    }


    btnDownloadPNG.disabled =
        false;

    btnDownloadPNG.innerHTML =
        originalText;

}

// =========================================================
// SALIN NOTA SEBAGAI GAMBAR
// =========================================================

async function copyNotaImage() {

    if (typeof html2canvas === "undefined") {

        showToast(
            "Library pembuat gambar belum dimuat."
        );

        return;
    }


    const paper =
        document.querySelector(".nota-paper");


    if (!paper) {

        showToast(
            "Preview nota belum tersedia."
        );

        return;
    }


    if (
        !navigator.clipboard ||
        typeof ClipboardItem === "undefined"
    ) {

        showToast(
            "Browser ini belum mendukung penyalinan gambar. Silakan gunakan Chrome atau Edge."
        );

        return;
    }


    const originalText =
        btnCopyNota.innerHTML;


    btnCopyNota.disabled = true;

    btnCopyNota.innerHTML =
        "⏳ Menyalin...";


    try {

        const canvas =
            await html2canvas(
                paper,
                {
                    scale: 3,

                    backgroundColor:
                        "#ffffff",

                    useCORS: true,

                    logging: false
                }
            );


        const blob =
            await new Promise(
                resolve => {

                    canvas.toBlob(
                        resolve,
                        "image/png"
                    );

                }
            );


        if (!blob) {

            throw new Error(
                "Gagal membuat gambar."
            );

        }


        const item =
            new ClipboardItem({
                "image/png": blob
            });


        await navigator.clipboard.write([
            item
        ]);


        btnCopyNota.innerHTML =
            "✅ Nota Tersalin!";
        
        showToast(
            "Nota berhasil disalin sebagai gambar."
        );    


        setTimeout(
            () => {

                btnCopyNota.innerHTML =
                    originalText;

            },
            2000
        );


    } catch (error) {

        console.error(
            "Gagal menyalin nota:",
            error
        );


        showToast(
            "Nota gagal disalin sebagai gambar.\n\n" +
            error.message
        );


        btnCopyNota.innerHTML =
            originalText;

    }


    btnCopyNota.disabled =
        false;

}

btnCopyNota.addEventListener(
    "click",
    copyNotaImage
);

btnDownloadPNG.addEventListener(
    "click",
    downloadNotaPNG
);

btnPreview.addEventListener(
    "click",
    tampilkanPreview
);


btnClosePreview.addEventListener(
    "click",
    tutupPreview
);


btnClosePreview2.addEventListener(
    "click",
    tutupPreview
);


previewModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            previewModal
        ) {

            tutupPreview();

        }

    }
);

    // =========================================================
    // INIT
    // =========================================================

    loadData();


    const restored =
        loadDraft();


    if (!restored) {

        setTanggalHariIni();

        nomorNotaElement.textContent =
            generateNomorNota();

        tambahItem();

    }


    hitungTotal();

    renderRiwayat();

});

function showToast(
    message,
    type = "success"
) {

    const container =
        document.getElementById(
            "toastContainer"
        );

    if (!container) {
        console.error(
            "toastContainer tidak ditemukan."
        );

        return;
    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast ${type}`;


    toast.textContent =
        message;


    container.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.style.opacity =
                "0";

            toast.style.transform =
                "translateY(10px)";


            setTimeout(
                () => {

                    toast.remove();

                },
                250
            );

        },
        2500
    );

}// =========================================================
// PENGATURAN
// =========================================================

const SETTING_KEY =
    "biruPrintingSettings";


const defaultSettings = {

    namaUsaha:
        "Biru Printing",

    deskripsiUsaha:
        "Spesialis Undangan Cetak dan Digital",

    nomorWhatsApp:
        "",

    footerNota:
        "Terima kasih telah mempercayai Biru Printing."

};


// =========================================================
// AMBIL DATA PENGATURAN
// =========================================================

function getSettings() {

    try {

        const saved =
            localStorage.getItem(
                SETTING_KEY
            );


        if (!saved) {

            return {
                ...defaultSettings
            };

        }


        return {
            ...defaultSettings,
            ...JSON.parse(saved)
        };


    } catch (error) {

        console.error(
            "Gagal membaca pengaturan:",
            error
        );


        return {
            ...defaultSettings
        };

    }

}


// =========================================================
// TAMPILKAN PENGATURAN
// =========================================================

function loadSettings() {

    const settings =
        getSettings();


    const namaUsaha =
        document.getElementById(
            "namaUsaha"
        );

    const deskripsiUsaha =
        document.getElementById(
            "deskripsiUsaha"
        );

    const nomorWhatsApp =
        document.getElementById(
            "nomorWhatsApp"
        );

    const footerNota =
        document.getElementById(
            "footerNota"
        );


    if (namaUsaha) {

        namaUsaha.value =
            settings.namaUsaha;

    }


    if (deskripsiUsaha) {

        deskripsiUsaha.value =
            settings.deskripsiUsaha;

    }


    if (nomorWhatsApp) {

        nomorWhatsApp.value =
            settings.nomorWhatsApp;

    }


    if (footerNota) {

        footerNota.value =
            settings.footerNota;

    }

}


// =========================================================
// SIMPAN PENGATURAN
// =========================================================

function saveSettings() {

    const namaUsaha =
        document.getElementById(
            "namaUsaha"
        );

    const deskripsiUsaha =
        document.getElementById(
            "deskripsiUsaha"
        );

    const nomorWhatsApp =
        document.getElementById(
            "nomorWhatsApp"
        );

    const footerNota =
        document.getElementById(
            "footerNota"
        );


    const settings = {

        namaUsaha:
            namaUsaha
                ? namaUsaha.value.trim()
                : defaultSettings.namaUsaha,

        deskripsiUsaha:
            deskripsiUsaha
                ? deskripsiUsaha.value.trim()
                : defaultSettings.deskripsiUsaha,

        nomorWhatsApp:
            nomorWhatsApp
                ? nomorWhatsApp.value.trim()
                : "",

        footerNota:
            footerNota
                ? footerNota.value.trim()
                : defaultSettings.footerNota

    };


    localStorage.setItem(
        SETTING_KEY,
        JSON.stringify(settings)
    );


    showToast(
        "✓ Pengaturan berhasil disimpan."
    );

}


// =========================================================
// TOMBOL SIMPAN
// =========================================================

const btnSimpanPengaturan =
    document.getElementById(
        "btnSimpanPengaturan"
    );


if (btnSimpanPengaturan) {

    btnSimpanPengaturan.addEventListener(
        "click",
        saveSettings
    );

}


// =========================================================
// LOAD SAAT APLIKASI DIBUKA
// =========================================================

loadSettings();