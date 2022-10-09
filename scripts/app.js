const config = new Config();
const modalCreateStudent = document.querySelector('#createStudentModal');
const modalBootStrapCreateStudent = new bootstrap.Modal(modalCreateStudent);

const supabasedb = supabase.createClient(config.supabaseURI, config.supabaseKey);

const getStudens = async () => {
  const tabBody = document.getElementById('tBody');
  const loading = document.getElementById('loading');
  let tr = "";

  loading.innerText = 'Loading...';

  const studentsResult = await supabasedb.from('Student')
                                         .select('*')
                                         .order('FirstName')
                                         .order('LastName')
                                         .order('id');

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
      <td><button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#editStudentModal">Edit</button>
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
    saveStudent.innerHTML = "Save";
    saveStudent.setAttribute('disabled', false);    
    const inputs = modalCreateStudent.querySelectorAll('input');
    inputs.forEach(input => {
      input.value = '';
    });
    // const closeModal = modalCreateStudent.querySelector('#closeCreateStudentModal');
    // closeModal.click();

    modalBootStrapCreateStudent.hide();
    getStudens();
  } else{
    alert('error while trying to save student');
  }
});