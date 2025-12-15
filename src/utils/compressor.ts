import * as fs from 'fs';
import * as path from 'path';
export function verifyIfFileExists(filenames: string[]) {
  const projectRoot = path.resolve(__dirname, '../../');

  for (let name of filenames) {
    const uploadDir = path.join(projectRoot, 'uploads', name);
    if (fs.existsSync(uploadDir)) {
      console.log('exists', name);
    } else {
      throw new Error(`not exists ${name}`);
    }
  }
}

export function deleteFile(input: string) {
  fs.unlink(input, () => {
    console.log('dleted file');
  });
}
