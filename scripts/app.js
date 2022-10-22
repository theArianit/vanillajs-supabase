const config = new Config();
const modalCreateStudent = document.querySelector('#createStudentModal');
const modalEditStudent = document.querySelector('#editStudentModal');
const modalDeleteStudent = document.querySelector('#deleteStudentModal');
const modalBootStrapCreateStudent = new bootstrap.Modal(modalCreateStudent);
const modalBootStrapEditStudent = new bootstrap.Modal(modalEditStudent);
const modalBootStrapDeleteStudent = new bootstrap.Modal(modalDeleteStudent);
const saveStudent = document.querySelector('#saveStudent');
const editStudent = document.querySelector('#editStudent');
const deleteStudent = document.querySelector('#deleteStudent');
const editStudentSuccessToast = document.getElementById('editStudentToast');
const editOrDeleteToast = new bootstrap.Toast(editStudentSuccessToast);
const studentToastSpan = document.getElementById('toastSpan');
const tabBody = document.getElementById('tBody');

const supabasedb = supabase.createClient(config.supabaseURI, config.supabaseKey);

const getRealtimeChanges = async() => {
  const channel = supabasedb
  .channel('table-db-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'Student' },
    (payload) => {
      if(payload.errors === null){
        console.log('payload: ', payload);
        if(payload.eventType === "INSERT"){
          addStudent(payload.new);
        }else if(payload.eventType === "UPDATE"){
          editStudentRealTime(payload.new);
        }else{
          removeStudentFromList(payload.old.id);
        }
      }else{ alert('Some error happened while synchronizing the data from the server');}
    } 
  )
  .subscribe();
}

getRealtimeChanges();

const addStudent = (student) => {
  let tr = "";
  tr = `<tr data-id="${student.id}">
      <td>${student.id}</td>
      <td data-firstname="${student.id}">${student.FirstName}</td>
      <td data-lastname="${student.id}">${student.LastName}</td>
      <td data-email="${student.id}">${student.Email}</td>
      <td data-country="${student.id}">${student.Country}</td>
      <td data-city="${student.id}">${student.City}</td>
      <td data-birthdate="${student.id}">${student.Birthdate}</td>
      <td><button class="btn btn-primary" 
                  data-bs-toggle="modal" 
                  data-bs-target="#editStudentModal"
                  onclick='getEditStudent(${student.id})'>Edit</button>
          <button class="btn btn-danger"
                  data-bs-toggle="modal"
                  data-bs-target="#deleteStudentModal"
                  onclick='getDeleteStudent(${student.id})'>Delete</button></td>
      </tr>`

      tabBody.innerHTML += tr;
}

const getStudens = async () => {
  // const tabBody = document.getElementById('tBody');
  const loading = document.getElementById('loading');
  let tr = "";
  tabBody.innerHTML = tr;

  loading.innerText = 'Loading...';

  const studentsResult = await supabasedb.from('Student')
                                         .select('*')
                                         .order('FirstName')
                                         .order('LastName')
                                         .order('id');

  if(studentsResult.status === 200 && studentsResult.data.length > 0 && studentsResult.error === null){
    loading.innerText = '';
    // let orderNr = 1;
    studentsResult.data.forEach(student => {
      tr = `<tr data-id="${student.id}">
      <td>${student.id}</td>
      <td data-firstname="${student.id}">${student.FirstName}</td>
      <td data-lastname="${student.id}">${student.LastName}</td>
      <td data-email="${student.id}">${student.Email}</td>
      <td data-country="${student.id}">${student.Country}</td>
      <td data-city="${student.id}">${student.City}</td>
      <td data-birthdate="${student.id}">${student.Birthdate}</td>
      <td><button class="btn btn-primary" 
                  data-bs-toggle="modal" 
                  data-bs-target="#editStudentModal"
                  onclick='getEditStudent(${student.id})'>Edit</button>
          <button class="btn btn-danger"
                  data-bs-toggle="modal"
                  data-bs-target="#deleteStudentModal"
                  onclick='getDeleteStudent(${student.id})'>Delete</button></td>
      </tr>`

      tabBody.innerHTML += tr;
      // orderNr++;
    });
  } else{
    loading.innerText = 'No students registered';
  }
}
getStudens();

saveStudent.addEventListener('click', async (e) => {
  e.preventDefault();
  let firstName = document.querySelector('#firstName').value;
  let lastName = document.querySelector('#lastName').value;
  let email = document.querySelector('#email').value;
  let country = document.querySelector('#country').value;
  let city = document.querySelector('#city').value;
  let birthdate = document.querySelector('#birthdate').value;

  saveStudent.innerHTML = "Saving...";
  saveStudent.setAttribute('disabled', true);

  const result = await supabasedb.from("Student").insert({
    FirstName: firstName,
    LastName: lastName,
    Country: country,
    Email: email,
    City: city,
    Birthdate: birthdate
  });

  if(result && result.status === 201){
    // saveStudent.innerHTML = "Save";
    // saveStudent.setAttribute('disabled', false);    
    const inputs = modalCreateStudent.querySelectorAll('input');
    inputs.forEach(input => {
      input.value = '';
    });
    // const closeModal = modalCreateStudent.querySelector('#closeCreateStudentModal');
    // closeModal.click();

    modalBootStrapCreateStudent.hide();
    getStudens();
  } else{
    alert('error while trying to save student: ');
  }
  saveStudent.innerHTML = "Saving...";
  saveStudent.removeAttribute('disabled');
});

let editStudentId = document.getElementById('spanStudentId');
let editFirstName = document.querySelector('#editFirstName');
let editLastName = document.querySelector('#editLastName');
let editEmail = document.querySelector('#editEmail');
let editCountry = document.querySelector('#editCountry');
let editCity = document.querySelector('#editCity');
let editBirthday = document.querySelector('#editBirthdate');

const getEditStudent = async (id) => {const inputs = modalEditStudent.querySelectorAll('input');
    inputs.forEach(input => {
      input.value = '';
    });
  
  const editResult = await supabasedb.from("Student")
                                     .select("*")
                                     .eq("id", id);

  if(editResult && editResult.status === 200){
    editStudentId.innerText = id;
    editFirstName.value = editResult.data[0].FirstName;
    editLastName.value = editResult.data[0].LastName;
    editEmail.value = editResult.data[0].Email;
    editCountry.value = editResult.data[0].Country;
    editCity.value = editResult.data[0].City;
    editBirthday.value = editResult.data[0].Birthdate;
  }
  else{    
    modalBootStrapEditStudent.hide();
  }
};

editStudent.addEventListener('click', async (e) => {
  e.preventDefault();

  editStudent.innerHTML = "Updating...";
  editStudent.setAttribute('disabled', true);
  const studentId = editStudentId.innerText;
  const fName = editFirstName.value;
  const lName = editLastName.value;
  const email = editEmail.value;
  const country = editCountry.value;
  const city = editCity.value;
  const birthday = editBirthday.value;

  const updateRes = await supabasedb.from("Student")
                                    .update({
                                        FirstName: fName,
                                        LastName: lName,
                                        Birthdate: birthday,
                                        Email: email,
                                        City: city,
                                        Country: country
                                      })
                                    .match({id: studentId});

  if(updateRes.error === null){
    const inputs = modalEditStudent.querySelectorAll('input');
    inputs.forEach(input => {
      input.value = '';
    });
    modalBootStrapEditStudent.hide();
    studentToastSpan.innerText = 'Student Updated Successfully';
    const studentObj = {
      Birthdate: birthday,
      City: city,
      Country: country,
      Email: email,
      FirstName: fName,
      LastName: lName,
      created_at: "",
      id: studentId
    };
    // getStudens();
    //editStudentRealTime(studentObj);
    editOrDeleteToast.show();
  } else{
    alert('error while trying to edit the student');
  }
  editStudent.innerHTML = "Update";
  // editStudent.setAttribute('disabled', false);
  editStudent.removeAttribute('disabled');
});

const editStudentInList = async (student) => {
  const studentFirstNameTD = document.querySelector(`td[data-firstname="${student.id}"]`);
  const studentLastNameTD = document.querySelector(`td[data-lastname="${student.id}"]`);
  const studentEmailTD = document.querySelector(`td[data-email="${student.id}"]`);
  const studentCountryTD = document.querySelector(`td[data-country="${student.id}"]`);
  const studentCityTD = document.querySelector(`td[data-city="${student.id}"]`);
  const studentBirthdateTD = document.querySelector(`td[data-birthdate="${student.id}"]`);

  studentFirstNameTD.innerHTML = student.FirstName;
  studentLastNameTD.innerHTML = student.LastName;
  studentEmailTD.innerHTML = student.Email;
  studentCountryTD.innerHTML = student.Country;
  studentCityTD.innerHTML = student.City;
  studentBirthdateTD.innerHTML = student.Birthdate;

  // for(let i = 0; i < studentTR.children.length - 1; i++){
  //   const studentTD = studentTR.children[i];
  //   console.log('innerHTML' , studentTD.innerHTML);
  //   console.log(`student[${i}] `, Object.values(student)[i]);
  //   console.log('entries: ', Object.entries(student)[i]);
  // }
}

let deleteStudentId = document.getElementById('spanDeleteStudentId');

const getDeleteStudent = async (studId) => {
  deleteStudentId.innerText = studId;
};

deleteStudent.addEventListener('click', async (e) => {
  e.preventDefault();

  deleteStudent.innerHTML = "Deleting...";
  deleteStudent.setAttribute('disabled', true);

  const studId = deleteStudentId.innerText;
  const deleteRes = await supabasedb.from("Student")
                                    .delete()
                                    .match({ id: studId });

  if(deleteRes.error === null){
    modalBootStrapDeleteStudent.hide();
    // getStudens();
    removeStudentFromList(studId);
    studentToastSpan.innerText = 'Student Deleted Successfully';
    editOrDeleteToast.show();
  }else{
    alert("Error while trying to delete student");
  }
  deleteStudent.innerHTML = 'Delete';
  deleteStudent.removeAttribute('disabled');
});

const removeStudentFromList = async (studId) => {
  const studentTR = document.querySelector(`tr[data-id="${studId}"]`);
  studentTR.remove();
}