const config = new Config();
const modalCreateStudent = document.querySelector('#createStudentModal');
const modalEditStudent = document.querySelector('#editStudentModal');
const modalBootStrapCreateStudent = new bootstrap.Modal(modalCreateStudent);
const modalBootStrapEditStudent = new bootstrap.Modal(modalEditStudent);
const saveStudent = document.querySelector('#saveStudent');
const editStudent = document.querySelector('#editStudent');
const editStudentSuccessToast = document.getElementById('editStudentToast');

const supabasedb = supabase.createClient(config.supabaseURI, config.supabaseKey);

const getStudens = async () => {
  const tabBody = document.getElementById('tBody');
  const loading = document.getElementById('loading');
  let tr = "";
  tabBody.innerHTML = tr;

  loading.innerText = 'Loading...';

  const studentsResult = await supabasedb.from('Student')
                                         .select('*')
                                         .order('FirstName')
                                         .order('LastName')
                                         .order('id');
  console.log('getstudents5');

  if(studentsResult.status === 200 && studentsResult.data.length > 0 && studentsResult.error === null){
    loading.innerText = '';
    studentsResult.data.forEach(student => {
      tr = `<tr>
      <td>${student.id}</td>
      <td>${student.FirstName}</td>
      <td>${student.LastName}</td>
      <td>${student.Email}</td>
      <td>${student.Country}</td>
      <td>${student.City}</td>
      <td>${student.Birthdate}</td>
      <td><button class="btn btn-primary" 
                  data-bs-toggle="modal" 
                  data-bs-target="#editStudentModal"
                  onclick='getEditStudent(${student.id})'>Edit</button>
      <button class="btn btn-danger">Delete</button></td>
      </tr>`

      tabBody.innerHTML += tr;
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
  saveStudent.setAttribute('disabled', false);
});

let editStudentId = document.getElementById('spanStudentId');
let editFirstName = document.querySelector('#editFirstName');
let editLastName = document.querySelector('#editLastName');
let editEmail = document.querySelector('#editEmail');
let editCountry = document.querySelector('#editCountry');
let editCity = document.querySelector('#editCity');
let editBirthday = document.querySelector('#editBirthdate');

const getEditStudent = async (id) => {
  const inputs = modalEditStudent.querySelectorAll('input');
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
    //const editToast = new bootstrap.Toast(editStudentSuccessToast);
   // editToast.show();
    getStudens();
  } else{
    console.log('updateRes: ', updateRes);
    alert('error while trying to edit the student');
  }
  editStudent.innerHTML = "Update";
  editStudent.setAttribute('disabled', false);
});