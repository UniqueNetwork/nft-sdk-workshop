
const imageParts = [
  { name: 'head', attrNames: ['Regular Head'] },
  { name: 'eye', attrNames: ['Normal Eyes', 'Tired Eyes', 'Brused Eyes'] },
  { name: 'brow', attrNames: ['Thick Brows', 'Greyish Brows', 'Flat Brows'] },
  { name: 'nose', attrNames: ['Snub Nose', 'Button Nose', 'Droopy Nose'] },
  { name: 'hair', attrNames: ['Normal Hair', 'Hipster Style', 'Messy Hair', 'Overdue for Haircut', 'Bald Patches'] },
  { name: 'mouth', attrNames: ['Smirk', 'Regular Smile', 'Wide Smile'] }
];

function genFaces(imageParts: any[]) {
  const faces: any[] = [];

  const recursion = (tuplePart: any[]) => {
    if (tuplePart.length === imageParts.length) {
      faces.push(tuplePart);
    } else {
      const array = imageParts[tuplePart.length].attrNames;
      for (const element of array) {
        const tuplePartWithNewElement = tuplePart.concat([{
          name: imageParts[tuplePart.length].name,
          value: element,
          image: `${imageParts[tuplePart.length].name}${array.indexOf(element) + 1}.png`,
        }]);
        recursion(tuplePartWithNewElement);
      }
    }

  };

  recursion([]);

  return faces;
}

function main() {
  const faces = genFaces(imageParts);
  console.log('faces: ', faces);
  console.log('length: ', faces.length);
}

main();
