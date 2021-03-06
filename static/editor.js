togglemathjax = function (enabled) {
    if (enabled) {
        if (!latexenabledonce) {
            MathJax.Hub.Config({
                "HTML-CSS": {
                    preferredFont: "TeX",
                    availableFonts: ["STIX", "TeX"],
                    linebreaks: {
                        automatic: true
                    },
                    EqnChunk: (MathJax.Hub.Browser.isMobile ? 10 : 50)
                },
                tex2jax: {
                    inlineMath: [
                        ["$", "$"],
                        ["\\\\(", "\\\\)"]
                    ],
                    displayMath: [
                        ["$$", "$$"],
                        ["\\[", "\\]"]
                    ],
                    processEscapes: true,
                    ignoreClass: "tex2jax_ignore|dno"
                },
                TeX: {
                    noUndefined: {
                        attributes: {
                            mathcolor: "red",
                            mathbackground: "#FFEEEE",
                            mathsize: "90%"
                        }
                    },
                    Macros: {
                        href: "{}"
                    }
                },
                messageStyle: "none",
                skipStartupTypeset: true
            });
            mjpd1.mathjaxEditing.prepareWmdForMathJax(editor, '', [
                ["$", "$"]
            ]);
            latexenabledonce = true;
            if (editor.refreshPreview !== undefined)
                editor.refreshPreview();
        } else {
            MathJax.Hub.queue.pending = 0;
            MathJax.Hub.Queue(["Typeset", MathJax.Hub, "wmd-preview"]);
        }
    } else {
        MathJax.Hub.queue.pending = 1;
        if (editor.refreshPreview !== undefined)
            editor.refreshPreview();
        else {
            MathJax.Hub.Config({
                skipStartupTypeset: true
            });
        }
    }
}

toggledarkmode = function (enabled) {
    $('body').toggleClass('dark-mode', enabled);
}

if (localStorage.getItem("writing") !== null) {
    $('#wmd-input').val(localStorage.getItem("writing"));
}

openFile = function (e) {
    readFile(e.target.files[0]);
}

readFile = function (file) { // https://stackoverflow.com/a/26298948/1422096
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
        var contents = e.target.result;
        $('#wmd-input').val(contents); // display file content
        editor.refreshPreview();
    };
    reader.readAsText(file);
}

document.getElementById('openFileInput').addEventListener('change', openFile, false);

$('body').on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
    })
    .on('drop', function (e) {
        readFile(e.originalEvent.dataTransfer.files[0]);
    });

$('#wmd-input').on('input', function () {
    localStorage.setItem("writing", $('#wmd-input').val());
});

$('#wmd-input').focus();

$('#helpicon').click(function () {
    $('#help').show();
});

$('#closeicon, #wmd-input, #wmd-preview').click(function () {
    $('#help').hide();
});

$(document).on('keydown', function (e) {
    if (e.keyCode == 80 && (e.ctrlKey || e.metaKey)) { // CTRL + P 
        if (mode != 1) {
            mode = 1;
            $('#wmd-input').hide();
            $('#wmd-preview').show();
            $('body').removeClass('fixedheight');
            $('html').removeClass('fixedheight');
            toggledarkmode(false);
            e.preventDefault();
            window.print();
            toggledarkmode(darkmodeenabled);
            return false;
        }
        //var doc = new jsPDF();
        //var specialElementHandlers = {'#editor': function (element, renderer) { return true; } };
        //doc.fromHTML($('#wmd-preview').html(), 15, 15, { 'width': 170, 'elementHandlers': specialElementHandlers });
        //doc.save('file.pdf');
        /*var restorepage = $('body').html();
        var printcontent = $('#wmd-preview').clone();
        $('body').empty().html(printcontent);
        window.print();
        $('body').html(restorepage);
        e.preventDefault();
        return false;*/
    } else if (e.keyCode == 83 && (e.ctrlKey || e.metaKey)) { // CTRL + S
        var blob = new Blob([$('#wmd-input').val()], {
            type: 'text'
        }); // https://stackoverflow.com/a/33542499/1422096
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveBlob(blob, 'newfile.md');
        } else {
            var elem = window.document.createElement('a');
            elem.href = window.URL.createObjectURL(blob);
            elem.download = 'newfile.md';
            document.body.appendChild(elem);
            elem.click();
            document.body.removeChild(elem);
        }
        e.preventDefault();
        return false;
    } else if (e.keyCode == 68 && (e.ctrlKey || e.metaKey) && !e.shiftKey) { // CTRL + D
        mode += 1;
        if (mode == 3) mode = 0;
        if (mode == 1) {
            $('#wmd-input').hide();
            $('#wmd-preview').show();
            $('body').removeClass('fixedheight');
            $('html').removeClass('fixedheight');
        } else if (mode == 2) {
            $('#wmd-preview').hide();
            $('#wmd-input').show().css('float', 'none').css('width', '100%').focus();
            $('body').addClass('fixedheight');
            $('html').addClass('fixedheight');
        } else {
            $('#wmd-input').show().css('float', 'left').css('width', '50%').focus();
            $('#wmd-preview').show();
        }
        e.preventDefault();
        return false;
    } else if (e.keyCode == 72 && (e.ctrlKey || e.metaKey) && e.shiftKey) { // CTRL + H
        $('#help').show();
        e.preventDefault();
        return false;
    } else if (e.keyCode == 68 && (e.ctrlKey || e.metaKey) && e.shiftKey) { // CTRL + SHIFT + D
        darkmodeenabled = !darkmodeenabled;
        localStorage.setItem("darkmode", darkmodeenabled ? "1" : "0");
        toggledarkmode(darkmodeenabled);
        e.preventDefault();
        return false;
    } else if (e.keyCode == 82 && (e.ctrlKey || e.metaKey) && e.shiftKey) { // CTRL + SHIFT + R
        $('html').toggleClass('texroman');
        e.preventDefault();
        return false;
    } else if (e.keyCode == 76 && (e.ctrlKey || e.metaKey) && e.shiftKey) { // CTRL + SHIFT + L 
        latexenabled = !latexenabled;
        localStorage.setItem("latex", latexenabled ? "1" : "0");
        togglemathjax(latexenabled);
        e.preventDefault();
        return false;
    } else if (e.keyCode == 79 && (e.ctrlKey || e.metaKey) && e.shiftKey) { // CTRL + SHIFT + O
        $('#openFileInput').click();
        e.preventDefault();
        return false;
    } else if (e.keyCode == 27) { // ESC
        $('#help').hide();
    }
});

var mode = 0;
var latexenabledonce = false;
var latexenabled = localStorage.getItem("latex") !== "0";
var darkmodeenabled = localStorage.getItem("darkmode") == "1";
var converter = Markdown.getSanitizingConverter();
Markdown.Extra.init(converter);
var editor = new Markdown.Editor(converter, '');
var mjpd1 = new mjpd();
togglemathjax(latexenabled);
toggledarkmode(darkmodeenabled);
editor.run();