var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class Terminal {
    constructor(obj) {
        this.obj = obj;
        this.obj.onkeydown = (ev) => {
            this.resolveLast(ev.key);
        };
        this.rejectLast = () => void null;
        this.resolveLast = () => void null;
    }
    setContent(elem) {
        while (this.obj.firstChild)
            this.obj.removeChild(this.obj.firstChild);
        elem.forEach((obj) => {
            this.obj.appendChild(obj);
        });
    }
    getch() {
        this.rejectLast();
        this.rejectLast = () => void null;
        this.resolveLast = () => void null;
        return new Promise((resolve, reject) => {
            this.resolveLast = resolve;
            this.rejectLast = reject;
        });
    }
}
export class RichTerminal {
    constructor(obj) {
        [this.obj, this.current_cursor, this.term_buffer] = [obj, 0, []];
    }
    span(text) {
        const d = document.createElement('span');
        d.appendChild(document.createTextNode(text));
        return d;
    }
    putchar(elem) {
        if (elem instanceof HTMLElement) {
            this.term_buffer[this.current_cursor++] = elem;
        }
        else {
            if (elem == '\b')
                this.current_cursor--;
            else if (elem == '\n')
                this.term_buffer[this.current_cursor++] = document.createElement('br');
            else
                this.term_buffer[this.current_cursor++] = this.span(elem);
        }
    }
    clear() {
        this.term_buffer = [];
        this.current_cursor = 0;
        this.obj.setContent(this.term_buffer);
    }
    setContent(elem) {
        this.term_buffer = elem;
        this.current_cursor = elem.length;
        this.obj.setContent(elem);
    }
    getch() {
        return this.obj.getch();
    }
    write(...str) {
        for (const i of str) {
            if (i instanceof HTMLElement) {
                this.putchar(i);
            }
            else {
                for (const s of i)
                    this.putchar(s);
            }
        }
        this.obj.setContent(this.term_buffer);
    }
    getline() {
        return __awaiter(this, void 0, void 0, function* () {
            const updateStr = (buffer, pos, str) => {
                const d = [...buffer.slice(0, pos)];
                for (const val of str)
                    d.push(this.span(val));
                return d;
            };
            const cursor_temp = this.current_cursor;
            let fin = '', cursor = 0;
            for (;;) {
                const i = yield this.getch();
                switch (i) {
                    case 'ArrowLeft': {
                        if (cursor > 0)
                            cursor--;
                        break;
                    }
                    case 'ArrowRight': {
                        if (cursor < fin.length)
                            cursor++;
                        break;
                    }
                    case 'Backspace': {
                        if (cursor > 0) {
                            fin = fin.slice(0, cursor - 1) + fin.slice(cursor--);
                            this.term_buffer = updateStr(this.term_buffer, this.current_cursor = cursor_temp, Array.from(fin));
                            this.obj.setContent(this.term_buffer);
                        }
                        break;
                    }
                    case 'Enter': {
                        this.current_cursor = this.term_buffer.length;
                        this.write('\n');
                        return fin;
                    }
                    default: {
                        if (i.length == 1) {
                            fin = fin.slice(0, cursor) + i + fin.slice(cursor++);
                            this.term_buffer = updateStr(this.term_buffer, this.current_cursor = cursor_temp, Array.from(fin));
                            this.obj.setContent(this.term_buffer);
                        }
                    }
                }
            }
        });
    }
}
