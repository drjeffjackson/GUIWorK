function CreateContainer(id, parent, width, height) {
  let divWrapper = document.createElement('div');
  parent.appendChild(divWrapper);

  divWrapper.id = id;
  divWrapper.style.width = width + 'px';
  divWrapper.style.height = height + 'px';
  divWrapper.style.backgroundColor = 'blue';


  return {
    id: id
  };
}

export { CreateContainer };
