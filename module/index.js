import { Terminal, RichTerminal } from './terminal.js';
import { FRIEND_LIST, PAGE_LIST } from '../blog/settings.js';
function ColorText(text, style = {}) {
  const d = document.createElement('span');
  d.appendChild(document.createTextNode(text));
  for (const i in style) d.style[i] = style[i];
  return d;
}
function Link(text, link) {
  const d = document.createElement('a');
  d.appendChild(document.createTextNode(text));
  d.href = link;
  d.style.textDecoration = 'underline';
  d.style.color = 'white';
  d.target = '_blank';
  return d;
}
async function app_blog(term, cmd) {
  switch (cmd[0]) {
    case null:
    case 'help': {
      term.write('blog [COMMAND] [OPTIONS]...\n');
      term.write('访问凌的博客。\n');
      term.write('- COMMANDS 命令选项:\n');
      term.write('  help 显示帮助消息。\n');
      term.write('  version 显示版本信息。\n');
      term.write('  show [id] 显示编号为id的页面。\n');
      term.write('  list 列出所有页面。\n');
      term.write('  friend 列出所有朋友。\n');
      if (cmd.length == 0) return 1;
      return 0;
    }
    case 'show': {
      if (cmd.length == 2) {
        let i = parseInt(cmd[1]);
        if (i < 0 || i >= PAGE_LIST.length) {
          term.write('此页面不存在。\n');
          return 1;
        }
        try {
          const val = await fetch(`blog/${i}/index.json`);
          if (val.ok) {
            term.write(`标题：${PAGE_LIST[i].title}\n`);
            term.write(`作者：${PAGE_LIST[i].author} 作于 ${new Date(PAGE_LIST[i].date).toUTCString()}\n`);
            term.write('正文：\n');
            const s = document.createElement('div');
            s.innerHTML = (await val.json()).content;
            term.write(s);
            return 0;
          }
          term.write(`读入页面异常(${val.status} ${val.statusText})。\n`);
          return 1;
        } catch (err) {
          console.error(err);
          term.write('读入页面时发生错误。\n');
          return 1;
        }
      }
      term.write('至少得指定一个编号吧！\n');
      return 0;
    }
    case 'list': {
      term.write('全部页面：\n');
      for (const i in PAGE_LIST) term.write(`${i} "${PAGE_LIST[i].title}" ${PAGE_LIST[i].author} 作于 ${new Date(PAGE_LIST[i].date).toUTCString()}\n`);
      term.write(`共 ${PAGE_LIST.length} 个结果\n`);
      return 0;
    }
    case 'friend': {
      term.write('朋友列表：\n');
      for (const i in FRIEND_LIST) {
        term.write(`${i} `, Link(FRIEND_LIST[i].name, FRIEND_LIST[i].url), ` ${FRIEND_LIST[i].desp}\n`);
      }
      term.write(`共 ${FRIEND_LIST.length} 个结果\n`);
      return 0;
    }
    case 'version': {
      term.write('blog utility, version 1.0.0 (javascript-browser)\n');
      term.write('此程序基于MIT协议。\n');
      break;
    }
    default: {
      term.write('未知命令。输入 blog help 来获得帮助。\n');
      return 1;
    }
  }
}
async function _system(term, cmd) {
  if (cmd.length == 0) return -1;
  switch (cmd[0]) {
    case 'blog': {
      return app_blog(term, cmd.slice(1));
    }
    case 'echo': {
      for (const n of cmd.slice(1)) {
        if (n[0] != '"') {
          term.write(`${n} `);
        } else {
          try {
            term.write(`${JSON.parse(n)} `);
          } catch (_) {
            term.write(`\necho: Syntax error near \`${n}\``);
            return 1;
          }
        }
      }
      term.write('\n');
      return 0;
    }
    case 'date': {
      const d = new Date();
      term.write(`Now date: ${d.toUTCString()}(${d.getTime()})\n`)
      return 0;
    }
    case 'help': {
      term.write('FurryR\'s blog, version 1.0.0 (javascript-browser)\n');
      term.write('List of commands:\n');
      term.write('help\n');
      term.write('clear\n');
      term.write('echo (string)...\n');
      term.write('exit\n');
      term.write('date\n');
      term.write('bash\n');
      term.write('blog [command] [options...]\n');
      term.write('This page is based on ',Link('Cli-Web','https://github.com/FurryR/cli-web'), ' Project.\n')
      return 0;
    }
    case 'bash': {
      return await app_bash(term);
    }
    case 'clear': {
      term.clear();
      return 0;
    }
    case 'exit': {
      term.write('logout\n');
      return -2;
    }
    default: {
      term.write(`${cmd[0]}: command not found\n`);
      return 255;
    }
  }
}
async function system(term, cmd) {
  const f = [];
  let temp = '';
  for (let i = 0, a = 0, j = 0, z = false; i < cmd.length; i++) {
    if (cmd[i] == '\\')
      z = !z;
    else if (cmd[i] == '"' && !z) {
      if (a == 0 || a == 1) a = !a;
    } else if (cmd[i] == '\'' && !z) {
      if (a == 0 || a == 2) a = ((!a) == 1 ? 2 : 0);
    } else
      z = false;
    if ((cmd[i] == '(' || cmd[i] == '{' || cmd[i] == '[') && a == 0)
      j++;
    else if ((cmd[i] == ')' || cmd[i] == '}' || cmd[i] == ']') && a == 0)
      j--;
    if (cmd[i] == ' ' && a == 0 && j == 0) {
      if (temp != '') f.push(temp);
      temp = '';
    } else temp += cmd[i];
  }
  if (temp != '') f.push(temp);
  return _system(term, f);
}
async function app_bash(term) {
  // let ret = 0;
  for (; ;) {
    term.write(ColorText('Browser', { color: 'green' }), ':', ColorText('~', { color: 'blue' }), '$ ');
    const r = await system(term, await term.getline());
    if (r == -2) return 0;
    // if (r != -1) ret = r;
  }
}
window.onload = () => {
  document.getElementById('test').focus();
  load();
};
async function load() {
  let term = new RichTerminal(new Terminal(document.getElementById('test')));
  term.write('Welcome to FurryR\'s blog v1.0.0 (cli-web 1.0.0-ghpages typescript)\n');
  term.write('  * Documentation: ', Link('https://github.com/FurryR/FurryR.github.io', 'https://github.com/FurryR/FurryR.github.io'), '\n');
  term.write(`  Now time ${new Date().toUTCString()}\n`);
  term.write('To show help run: help\n\n\n');
  app_bash(term);
}