import { Project, SyntaxKind } from 'ts-morph';

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function isSnakeCase(str: string): boolean {
  return /^[a-z]+(_[a-z]+)*$/.test(str);
}

function transformVariables(filePath: string): void {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(filePath);

  sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration).forEach((declaration) => {
    const nameNode = declaration.getNameNode();
    const name = nameNode.getText();

    if (isSnakeCase(name)) {
      const camelCaseName = snakeToCamel(name);
      nameNode.replaceWithText(camelCaseName);
      console.log(`変換: ${name} => ${camelCaseName}`);
    }
  });

  sourceFile.saveSync();
}


const targetFilePath = './main.ts'; // 変換対象のファイルパス
transformVariables(targetFilePath);