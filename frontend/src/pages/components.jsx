import { useState } from "react"
import { SelectField, TextField, NumberField, CheckboxField, RadioField, Button, TextAreaField, ToggleSwitch, ImageUploadField, CategoryTreeField, PhoneField } from "../components/DataFields"
import { Table } from "../components/Tables"
import { Accordion } from "../components/Accordion"
import { Alert, Dialog, Snackbar, Loading, Drawer } from "../components/Popups"
import { SectionDivider, VerticalTabs } from "../components/SectionDivider"
import { Stepper } from "../components/Stepper"
import { AddItem } from "../components/AddItem"

export const Components = () => {
  const [username, setUsername] = useState("")
  const [uploadedImage, setUploadedImage] = useState(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [agreed, setAgreed] = useState(false)
  
  // Number Field States
  const [numberValue, setNumberValue] = useState('')
  const [ageValue, setAgeValue] = useState('')
  const [priceValue, setPriceValue] = useState('')
  
  const [selectedOption1, setSelectedOption1] = useState("")
  const [selectedOption2, setSelectedOption2] = useState("")
  const [selectedOption3, setSelectedOption3] = useState([])
  const [selectedOption4, setSelectedOption4] = useState([])

  const [gender, setGender] = useState('')

  // Toggle States
  const [toggle1, setToggle1] = useState(false)
  const [toggle2, setToggle2] = useState(true)
  const [toggle3, setToggle3] = useState(false)

  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [showWarningAlert, setShowWarningAlert] = useState(false)
  const [showInfoAlert, setShowInfoAlert] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  
  const [showSnackbarBottom, setShowSnackbarBottom] = useState(false)
  const [showSnackbarTop, setShowSnackbarTop] = useState(false)
  const [showSnackbarLeft, setShowSnackbarLeft] = useState(false)
  const [showSnackbarRight, setShowSnackbarRight] = useState(false)
  
  const [showLoadingDialog, setShowLoadingDialog] = useState(false)
  
  const [description, setDescription] = useState("")
  const [richTextContent, setRichTextContent] = useState("<p>Edit this rich text content...</p>")
  
  const [showDrawer, setShowDrawer] = useState(false)

  // Stepper states
  const [stepperStep1, setStepperStep1] = useState(1)
  const [stepperStep2, setStepperStep2] = useState(1)
  const [stepperStep3, setStepperStep3] = useState(1)

  // AddItem demo states
  const [demoAttributes, setDemoAttributes] = useState([])
  const [demoPrices, setDemoPrices] = useState([])

  // CategoryTreeField demo state
  const [demoSelectedCategories, setDemoSelectedCategories] = useState([])

  // PhoneField demo state
  const [demoPhone, setDemoPhone] = useState('')
  const [demoPhoneRequired, setDemoPhoneRequired] = useState('')
  const [demoPhoneError, setDemoPhoneError] = useState('')

  const demoCategoryItems = [
    { id: 1,  name: 'Electronics',         parent_id: null },
    { id: 2,  name: 'Computers',           parent_id: 1    },
    { id: 3,  name: 'Laptops',             parent_id: 2    },
    { id: 4,  name: 'Desktops',            parent_id: 2    },
    { id: 5,  name: 'Accessories',         parent_id: 2    },
    { id: 6,  name: 'Smartphones',         parent_id: 1    },
    { id: 7,  name: 'Android',             parent_id: 6    },
    { id: 8,  name: 'iOS',                 parent_id: 6    },
    { id: 9,  name: 'Audio',               parent_id: 1    },
    { id: 10, name: 'Headphones',          parent_id: 9    },
    { id: 11, name: 'Speakers',            parent_id: 9    },
    { id: 12, name: 'Clothing',            parent_id: null },
    { id: 13, name: 'Men',                 parent_id: 12   },
    { id: 14, name: 'T-Shirts',            parent_id: 13   },
    { id: 15, name: 'Jeans',               parent_id: 13   },
    { id: 16, name: 'Women',               parent_id: 12   },
    { id: 17, name: 'Dresses',             parent_id: 16   },
    { id: 18, name: 'Tops',                parent_id: 16   },
    { id: 19, name: 'Food & Beverages',    parent_id: null },
    { id: 20, name: 'Beverages',           parent_id: 19   },
    { id: 21, name: 'Soft Drinks',         parent_id: 20   },
    { id: 22, name: 'Juices',              parent_id: 20   },
    { id: 23, name: 'Snacks',              parent_id: 19   },
  ]

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ]

  const options = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' }
  ]

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' }
  ]

  const data = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' }
  ]

  return (
    <>
    <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">Image Upload Field</h1>
      <ImageUploadField
        label="Profile Image"
        value={uploadedImage}
        onChange={setUploadedImage}
        helperText="Upload a profile image (JPG, PNG)"
        accept="image/*"
        variant="outlined"
        fullWidth
      />
      <h1 className="mb-5 text-2xl font-bold text-gray-900 dark:text-white">TextField</h1>
      <div className="flex flex-col gap-4">
        <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <TextField 
          label="Password" 
          type="password"
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          helperText="Password toggle enabled by default"
        />
        <TextField 
          label="Password (No Toggle)" 
          type="password"
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          showPasswordToggle={false}
          helperText="Password toggle disabled"
        />
      </div>

      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">TextArea</h1>
      <TextAreaField 
        label="Description" 
        value={description} 
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        resize="vertical"
        maxLength={500}
        showCharCount={true}
      />

      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">Rich Text Editor</h1>
      <TextAreaField 
        label="Rich Text Content" 
        value={richTextContent} 
        onChange={(e) => setRichTextContent(e.target.value)}
        richText={true}
        rows={6}
        resize="vertical"
      />

      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">SelectField</h1>
      <SelectField label="Options" value={selectedOption1} options={options} onChange={(e) => setSelectedOption1(e.target.value)} />

      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">Search SelectField</h1>
      <SelectField label="Options" value={selectedOption2} options={options} searchable={true} onChange={(e) => setSelectedOption2(e.target.value)} />

      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">Multiple SelectField</h1>
      <SelectField label="Options" value={selectedOption3} options={options} multiple={true} onChange={(e) => setSelectedOption3(e.target.value)} />

      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">Multiple Search SelectField</h1>
      <SelectField label="Country" value={selectedOption4} options={options} multiple={true} searchable={true} onChange={(e) => setSelectedOption4(e.target.value)} />

      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">Checkbox</h1>
      <CheckboxField label="I agree to terms and conditions" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />

      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">Number Fields</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
        <NumberField 
          label="Basic Number"
          value={numberValue}
          onChange={(e) => setNumberValue(e.target.value)}
        />
        <NumberField 
          label="Age"
          value={ageValue}
          onChange={(e) => setAgeValue(e.target.value)}
          min={0}
          max={120}
          helperText="Age must be between 0-120"
        />
      </div>

      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">Radio Buttons</h1>
      <RadioField label="Gender" name="gender" value={gender} options={genderOptions} onChange={(e) => setGender(e.target.value)} required />

      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">Toggle Switch</h1>
      <div className="flex flex-col gap-6 my-5">
        <ToggleSwitch
          label="Enable Notifications"
          checked={toggle1}
          onChange={(e) => setToggle1(e.target.checked)}
        />
        <ToggleSwitch
          leftLabel="Light"
          rightLabel="Dark"
          checked={toggle2}
          onChange={(e) => setToggle2(e.target.checked)}
          leftIcon={
            <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          }
          rightIcon={
            <svg className="w-3 h-3 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ToggleSwitch
            label="Small"
            checked={toggle3}
            onChange={(e) => setToggle3(e.target.checked)}
            size="small"
          />
          <ToggleSwitch
            label="Medium"
            checked={toggle3}
            onChange={(e) => setToggle3(e.target.checked)}
            size="medium"
          />
          <ToggleSwitch
            label="Large"
            checked={toggle3}
            onChange={(e) => setToggle3(e.target.checked)}
            size="large"
          />
        </div>
        <ToggleSwitch
          label="Disabled"
          checked={false}
          onChange={() => {}}
          disabled
          helperText="This toggle is disabled"
        />
      </div>

      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">Buttons</h1>
      <div className="flex space-x-4 my-5">
        <Button type="submit" variant="primary">Submit</Button>
        <Button variant="secondary">Cancel</Button>
        <Button variant="outlined">View</Button>
      </div>

      {/* use endIcon to set icon at the end */}
      <Button type="submit" variant="primary" startIcon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      }>Add New</Button>

      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">Table</h1>
      <Table
        columns={columns}
        data={data}
        selectable={true}
        expandable={true}
        searchable={true}
        filterable={true}
        pagination={true}
        bulkActions={[
          { label: 'Delete Selected', onClick: (rows) => console.log(rows) },
          { label: 'Export Selected', onClick: (rows) => console.log(rows) }
        ]}
        renderExpandedRow={(row) => <div>Details for {row.name}</div>}
        actions={[
          {
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            ),
            label: 'Edit',
            onClick: (row) => console.log('Edit', row)
          },
          {
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            ),
            label: 'Delete',
            onClick: (row) => console.log('Delete', row)
          },
          {
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ),
            label: 'View',
            onClick: (row) => console.log('View', row)
          }
        ]}
      />

      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">Accordion</h1>
      <Accordion
        items={[
          { 
            title: 'Simple Text Content', 
            content: 'This is simple text content in the accordion.' 
          },
          { 
            title: 'Form Fields', 
            content: (
              <div className="space-y-3">
                <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
                <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Button variant="primary">Submit</Button>
              </div>
            )
          },
          { 
            title: 'Rich Content with Images & Lists', 
            content: (
              <div className="space-y-2">
                <p className="font-semibold">Features:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Supports any React element</li>
                  <li>Form fields, buttons, images</li>
                  <li>Tables, lists, and more</li>
                </ul>
                <div className="mt-3 flex gap-2">
                  <Button variant="outlined" size="small">Learn More</Button>
                  <Button variant="primary" size="small">Get Started</Button>
                </div>
              </div>
            )
          },
          { 
            title: 'Nested Components', 
            content: (
              <div className="space-y-3">
                <CheckboxField label="Enable notifications" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                <SelectField 
                  label="Choose option" 
                  value={selectedOption1} 
                  options={options} 
                  onChange={(e) => setSelectedOption1(e.target.value)} 
                />
                <TextAreaField 
                  label="Comments" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            )
          }
        ]}
        allowMultiple={false}
        iconPosition="right"
        defaultExpanded={[0]}
        groupTitle="Accordion with Different Content Types"
        variant="filled"
      />

      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">Alerts</h1>
      <div className="flex flex-wrap gap-4 my-5">
        <Button variant="primary" onClick={() => setShowSuccessAlert(true)}>
          Show Success
        </Button>
        <Button variant="secondary" onClick={() => setShowErrorAlert(true)}>
          Show Error
        </Button>
        <Button variant="outlined" onClick={() => setShowWarningAlert(true)}>
          Show Warning
        </Button>
        <Button variant="outlined" onClick={() => setShowInfoAlert(true)}>
          Show Info
        </Button>
      </div>

      {/* Alert Components */}
      <Alert
        type="success"
        message="Operation completed successfully!"
        position="top"
        isOpen={showSuccessAlert}
        onClose={() => setShowSuccessAlert(false)}
      />
      <Alert
        type="error"
        message="Something went wrong. Please try again."
        position="top"
        isOpen={showErrorAlert}
        onClose={() => setShowErrorAlert(false)}
      />
      <Alert
        type="warning"
        message="Warning! This action cannot be undone."
        position="bottom"
        isOpen={showWarningAlert}
        onClose={() => setShowWarningAlert(false)}
      />
      <Alert
        type="info"
        message="This is an informational message for you."
        position="bottom"
        isOpen={showInfoAlert}
        onClose={() => setShowInfoAlert(false)}
      />

      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">Dialog</h1>
      <Button variant="primary" onClick={() => setShowDialog(true)}>
        Open Dialog
      </Button>

      {/* Dialog Component */}
      <Dialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        title="Sample Dialog"
        size="medium"
        onSubmit={() => {
          console.log('Submitted')
          setShowDialog(false)
        }}
        onCancel={() => setShowDialog(false)}
      >
        <div className="space-y-4">
          <p>This is a sample dialog with scrollable content.</p>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <p>Add more content here to test scrolling...</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <p>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        </div>
      </Dialog>

      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">Snackbar</h1>
      <div className="flex gap-3 flex-wrap">
        <Button variant="primary" onClick={() => setShowSnackbarBottom(true)}>
          Bottom Left
        </Button>
        <Button variant="secondary" onClick={() => setShowSnackbarTop(true)}>
          Top Left
        </Button>
        <Button variant="outlined" onClick={() => setShowSnackbarLeft(true)}>
          Top Right
        </Button>
        <Button variant="outlined" onClick={() => setShowSnackbarRight(true)}>
          Bottom Right
        </Button>
      </div>

      {/* Snackbar Components */}
      <Snackbar
        message="Snackbar from bottom left corner"
        position="bottom-left"
        isOpen={showSnackbarBottom}
        onClose={() => setShowSnackbarBottom(false)}
      />
      <Snackbar
        message="Snackbar from top left corner"
        position="top-left"
        isOpen={showSnackbarTop}
        onClose={() => setShowSnackbarTop(false)}
      />
      <Snackbar
        message="Snackbar from top right corner"
        position="top-right"
        isOpen={showSnackbarLeft}
        onClose={() => setShowSnackbarLeft(false)}
        action={{
          label: 'Undo',
          onClick: () => console.log('Undo clicked')
        }}
      />
      <Snackbar
        message="Snackbar from bottom right corner"
        position="bottom-right"
        isOpen={showSnackbarRight}
        onClose={() => setShowSnackbarRight(false)}
      />

      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">Loading Animation</h1>
      <div className="flex gap-3 flex-wrap items-center">
        <div className="p-4 border border-gray-300 dark:border-gray-600 rounded">
          <Loading size="small" />
        </div>
        <div className="p-4 border border-gray-300 dark:border-gray-600 rounded">
          <Loading size="medium" text="Loading..." />
        </div>
        <div className="p-4 border border-gray-300 dark:border-gray-600 rounded">
          <Loading size="large" text="Please wait" />
        </div>
        <Button variant="primary" onClick={() => setShowLoadingDialog(true)}>
          Show Loading Dialog
        </Button>
      </div>

      {/* Loading Dialog */}
      <Dialog
        isOpen={showLoadingDialog}
        onClose={() => setShowLoadingDialog(false)}
        title="Processing"
        size="small"
        showFooter={false}
        showHeader={false}
      >
        <div className="py-8 flex justify-center">
          <Loading size="large" text="Please wait while we process your request..." />
        </div>
      </Dialog>

      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">Side Drawer</h1>
      <Button variant="primary" onClick={() => setShowDrawer(true)}>
        Open Side Drawer
      </Button>

      {/* Side Drawer */}
      <Drawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        title="Side Drawer Example"
      >
        <div className="space-y-4">
          <p>This is a side drawer that slides from the right side of the screen.</p>
          <p>Features:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Opens at 50% width by default</li>
            <li>Partially transparent backdrop (30% opacity)</li>
            <li>Fullscreen toggle button</li>
            <li>Respects sidebar when fullscreen</li>
            <li>Smooth slide animation</li>
          </ul>
          
          <TextField 
            label="Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
          <TextField 
            label="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <TextAreaField 
            label="Message" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
          
          <div className="flex gap-2">
            <Button variant="primary">Submit</Button>
            <Button variant="outlined" onClick={() => setShowDrawer(false)}>Cancel</Button>
          </div>
          
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-8">
            Click the fullscreen icon to expand the drawer to full width (respecting the sidebar).
          </p>
        </div>
      </Drawer>

      {/* Vertical Tabs */}
      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">Vertical Tabs</h1>
      <div className="bg-white dark:bg-[#18181b] rounded-lg p-6 " style={{ minHeight: '500px' }}>
        <VerticalTabs
          tabs={[
            {
              label: 'Profile',
              icon: '',
              description: 'Manage your profile',
              content: (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Settings</h2>
                  <p className="text-gray-600 dark:text-gray-400">Update your profile information and preferences.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <TextField label="First Name" value={name} onChange={(e) => setName(e.target.value)} />
                    <TextField label="Last Name" value="" onChange={() => {}} />
                    <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" fullWidth />
                    <TextField label="Phone" value="" onChange={() => {}} />
                  </div>
                  <div className="mt-6">
                    <Button variant="primary">Save Changes</Button>
                  </div>
                </div>
              )
            },
            {
              label: 'Security',
              icon: '🔒',
              description: 'Security settings',
              badge: '2',
              content: (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security Settings</h2>
                  <p className="text-gray-600 dark:text-gray-400">Manage your password and authentication methods.</p>
                  <div className="space-y-4 mt-6">
                    <TextField label="Current Password" type="password" value="" onChange={() => {}} fullWidth />
                    <TextField label="New Password" type="password" value="" onChange={() => {}} fullWidth />
                    <TextField label="Confirm Password" type="password" value="" onChange={() => {}} fullWidth />
                    <CheckboxField label="Enable two-factor authentication" checked={false} onChange={() => {}} />
                  </div>
                  <div className="mt-6">
                    <Button variant="primary">Update Password</Button>
                  </div>
                </div>
              )
            },
            {
              label: 'Notifications',
              icon: '🔔',
              description: 'Notification preferences',
              content: (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>
                  <p className="text-gray-600 dark:text-gray-400">Choose how you want to be notified.</p>
                  <div className="space-y-4 mt-6">
                    <CheckboxField label="Email notifications" checked={true} onChange={() => {}} />
                    <CheckboxField label="Push notifications" checked={true} onChange={() => {}} />
                    <CheckboxField label="SMS notifications" checked={false} onChange={() => {}} />
                    <CheckboxField label="Weekly summary" checked={true} onChange={() => {}} />
                  </div>
                  <div className="mt-6">
                    <Button variant="primary">Save Preferences</Button>
                  </div>
                </div>
              )
            },
            {
              label: 'Billing',
              icon: '💳',
              description: 'Billing & payments',
              content: (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Billing Information</h2>
                  <p className="text-gray-600 dark:text-gray-400">Manage your payment methods and billing history.</p>
                  <div className="mt-6 space-y-4">
                    <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Visa ending in 4242</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Expires 12/2025</p>
                        </div>
                        <Button variant="outlined" size="small">Remove</Button>
                      </div>
                    </div>
                    <Button variant="secondary">Add Payment Method</Button>
                  </div>
                </div>
              )
            },
            {
              label: 'Advanced',
              icon: '⚙️',
              description: 'Advanced settings',
              disabled: true,
              content: null
            }
          ]}
        />
      </div>

      {/* ── Stepper ── */}
      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">Stepper — Horizontal (default)</h1>
      <div className="bg-white dark:bg-[#18181b] rounded-lg p-8 border border-gray-200 dark:border-gray-700">
        <Stepper
          variant="default"
          activeStep={stepperStep1}
          onStepClick={setStepperStep1}
          steps={[
            {
              label: 'Account Info', description: 'Basic details',
              content: (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Step 1 — Account Info</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Enter your username and password to create your account.</p>
                </div>
              )
            },
            {
              label: 'Verification', description: 'Confirm email',
              content: (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Step 2 — Verification</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Check your inbox and enter the 6-digit code we sent you.</p>
                </div>
              )
            },
            {
              label: 'Profile', description: 'Set up profile',
              content: (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Step 3 — Profile</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Upload a photo and fill in your display name and bio.</p>
                </div>
              )
            },
            {
              label: 'Complete', description: 'All done!',
              content: (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">🎉 All done!</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Your account is ready. You can now log in and start using the app.</p>
                </div>
              )
            },
          ]}
        />
        <div className="flex gap-2 mt-8 justify-center">
          <button type="button" onClick={() => setStepperStep1(s => Math.max(0, s - 1))}
            className="px-4 py-1.5 text-sm rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">Back</button>
          <button type="button" onClick={() => setStepperStep1(s => Math.min(3, s + 1))}
            className="px-4 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700">Next</button>
        </div>
      </div>

      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">Stepper — Vertical</h1>
      <div className="bg-white dark:bg-[#18181b] rounded-lg p-8 border border-gray-200 dark:border-gray-700 max-w-sm">
        <Stepper
          variant="vertical"
          activeStep={stepperStep2}
          onStepClick={setStepperStep2}
          steps={[
            {
              label: 'Select Plan', description: 'Choose the best plan for you.',
              content: (
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Step 1 — Select Plan</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Browse available plans and pick the one that fits your needs.</p>
                </div>
              )
            },
            {
              label: 'Payment', description: 'Enter your payment details.',
              content: (
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Step 2 — Payment</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Provide your card number, expiry date, and CVV.</p>
                </div>
              )
            },
            {
              label: 'Confirmation', description: 'Review and confirm your order.',
              content: (
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Step 3 — Confirmation</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Review your order summary before finalising.</p>
                </div>
              )
            },
            {
              label: 'Done', description: 'Your subscription is active.',
              content: (
                <div>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">✅ Subscription Active</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Thank you! Your plan is now active. Enjoy your subscription.</p>
                </div>
              )
            },
          ]}
        />
        <div className="flex gap-2 mt-2">
          <button type="button" onClick={() => setStepperStep2(s => Math.max(0, s - 1))}
            className="px-4 py-1.5 text-sm rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">Back</button>
          <button type="button" onClick={() => setStepperStep2(s => Math.min(3, s + 1))}
            className="px-4 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700">Next</button>
        </div>
      </div>

      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">Stepper — Progress</h1>
      <div className="bg-white dark:bg-[#18181b] rounded-lg p-8 border border-gray-200 dark:border-gray-700">
        <Stepper
          variant="progress"
          activeStep={stepperStep3}
          onStepClick={setStepperStep3}
          steps={[
            { label: 'Cart',     content: <p className="text-sm text-gray-500 dark:text-gray-400">Your cart has 3 items. Review them before proceeding.</p> },
            { label: 'Shipping', content: <p className="text-sm text-gray-500 dark:text-gray-400">Enter your delivery address and choose a shipping method.</p> },
            { label: 'Payment',  content: <p className="text-sm text-gray-500 dark:text-gray-400">Provide your payment information securely.</p> },
            { label: 'Review',   content: <p className="text-sm text-gray-500 dark:text-gray-400">Review your full order — items, address, and payment — before placing.</p> },
            { label: 'Placed',   content: <p className="text-sm text-green-600 dark:text-green-400">🎉 Order placed! You'll receive a confirmation email shortly.</p> },
          ]}
        />
        <div className="flex gap-2 mt-8 justify-center">
          <button type="button" onClick={() => setStepperStep3(s => Math.max(0, s - 1))}
            className="px-4 py-1.5 text-sm rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">Back</button>
          <button type="button" onClick={() => setStepperStep3(s => Math.min(4, s + 1))}
            className="px-4 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700">Next</button>
        </div>
      </div>

      {/* SectionDivider Horizontal Tabs */}
      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">Horizontal Tabs (SectionDivider)</h1>
      <div className="bg-white dark:bg-[#18181b] rounded-lg p-6 border border-gray-600" style={{ minHeight: '300px' }}>
        <SectionDivider
          tabs={[
            {
              label: 'Overview',
              icon: '📄',
              badge: 'New',
              description: 'General information',
              content: (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Overview</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">This is the overview tab content.</p>
                </div>
              )
            },
            {
              label: 'Details',
              icon: '🔍',
              description: 'More details',
              content: (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Details</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">This is the details tab content.</p>
                </div>
              )
            },
            {
              label: 'Settings',
              icon: '⚙️',
              badge: '3',
              description: 'Configuration options',
              content: (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">This is the settings tab content.</p>
                </div>
              )
            },
            {
              label: 'Disabled',
              icon: '🚫',
              description: 'Disabled tab',
              disabled: true,
              content: null
            }
          ]}
          defaultTab={0}
        />
      </div>

      {/* ── AddItem ─────────────────────────────────────────────────────────── */}
      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">AddItem</h1>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        A dynamic row-based input component. Define any combination of field types — the component
        handles adding, editing, and removing rows and returns values as a controlled array.
      </p>

      {/* Example 1 — Product attributes */}
      <div className="bg-white dark:bg-[#18181b] rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">Example 1 — Product Attributes</h2>
        <AddItem
          label="Product Attributes"
          addLabel="Add Attribute"
          fields={[
            {
              key:         'name',
              label:       'Attribute Name',
              type:        'text',
              placeholder: 'e.g. Color',
              width:       '1fr',
              required:    true,
            },
            {
              key:     'type',
              label:   'Type',
              type:    'select',
              width:   '160px',
              options: [
                { value: 'text',    label: 'Text' },
                { value: 'number',  label: 'Number' },
                { value: 'boolean', label: 'Boolean' },
                { value: 'color',   label: 'Color' },
                { value: 'size',    label: 'Size' },
              ],
            },
            {
              key:         'value',
              label:       'Value(s)',
              type:        'text',
              placeholder: 'e.g. Red, Blue, Green',
              width:       '2fr',
            },
            {
              key:          'filterable',
              label:        'Filterable',
              type:         'toggle',
              width:        '80px',
              defaultValue: false,
            },
          ]}
          value={demoAttributes}
          onChange={setDemoAttributes}
          emptyMessage="No attributes yet. Click 'Add Attribute' to define one."
        />
        {demoAttributes.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">output (array)</p>
            <pre className="text-xs text-green-600 dark:text-green-400 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(demoAttributes, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Example 2 — Pricing tiers */}
      <div className="bg-white dark:bg-[#18181b] rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">Example 2 — Pricing Tiers</h2>
        <AddItem
          label="Price List"
          addLabel="Add Price Tier"
          fields={[
            {
              key:     'tier',
              label:   'Price Type',
              type:    'select',
              width:   '180px',
              options: [
                { value: 'retail',     label: 'Retail' },
                { value: 'wholesale',  label: 'Wholesale' },
                { value: 'distributor',label: 'Distributor' },
                { value: 'vip',        label: 'VIP / Member' },
              ],
              required: true,
            },
            {
              key:         'amount',
              label:       'Amount',
              type:        'number',
              placeholder: '0.00',
              width:       '120px',
              required:    true,
            },
            {
              key:         'notes',
              label:       'Notes',
              type:        'text',
              placeholder: 'Optional note...',
              width:       '1fr',
            },
          ]}
          value={demoPrices}
          onChange={setDemoPrices}
          emptyMessage="No pricing tiers defined. Click 'Add Price Tier' to start."
        />
        {demoPrices.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">output (array)</p>
            <pre className="text-xs text-green-600 dark:text-green-400 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(demoPrices, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">Category Tree Field</h1>
      <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#18181B] max-w-md">
        <CategoryTreeField
          label="Product Categories"
          items={demoCategoryItems}
          value={demoSelectedCategories}
          onChange={setDemoSelectedCategories}
          fullWidth
        />
        {demoSelectedCategories.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">selected ids</p>
            <pre className="text-xs text-green-600 dark:text-green-400 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(demoSelectedCategories, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <h1 className="my-5 text-2xl font-bold text-gray-900 dark:text-white">Phone Field</h1>
      <div className="flex flex-col gap-4 p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#18181B] max-w-md">
        <PhoneField
          label="Phone Number"
          value={demoPhone}
          onChange={setDemoPhone}
          fullWidth
          helperText="Default country: US (+1)"
        />
        <PhoneField
          label="Mobile (required)"
          value={demoPhoneRequired}
          onChange={setDemoPhoneRequired}
          defaultCode="+94"
          fullWidth
          required
          helperText="Default country: Sri Lanka (+94)"
        />
        <PhoneField
          label="Contact (error state)"
          value={demoPhoneError}
          onChange={setDemoPhoneError}
          defaultCode="+44"
          fullWidth
          error
          helperText="This field has an error"
        />
        <PhoneField
          label="Phone (disabled)"
          value="+49 30123456"
          onChange={() => {}}
          defaultCode="+49"
          fullWidth
          disabled
        />
        {demoPhone && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">value</p>
            <code className="text-xs text-green-600 dark:text-green-400">{demoPhone}</code>
          </div>
        )}
      </div>

    </>
  )
}

