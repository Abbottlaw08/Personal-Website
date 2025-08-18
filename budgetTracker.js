function showBudgetTracker() {
    const projectsH1 = document.querySelector('#projects h1');
    if (projectsH1) projectsH1.style.display = 'none';
    document.getElementById('projectsMenu').style.display = 'none';
    document.getElementById('budgetTrackerContainer').style.display = 'block';
    document.getElementById('budgetResult').style.display = 'flex'; // Use flex to match styling

    // Initialize save inputs button state
    const saveBtn = document.getElementById('saveInputsBtn');
    if (saveBtn) {
        if (saveInputsEnabled) {
            saveBtn.classList.add('active');
            saveBtn.innerHTML = '💾 Saving Inputs';
        } else {
            saveBtn.classList.remove('active');
            saveBtn.innerHTML = '💾 Save Inputs';
        }
    }
    
    // Sync layout state with the current toggle
    togglePeopleCount('one');
    // Initialize bills list display
    updateBillsList();
    // Initialize deductions lists
    updateDeductionsList(1);
    updateDeductionsList(2);
    // Load saved inputs if enabled
    loadSavedInputs();
    // Add input change listeners for saving
    // Add input change listeners for saving
    addInputChangeListeners();
}

function returnToProjectsMenu() {
    const projectsH1 = document.querySelector('#projects h1');
    if (projectsH1) projectsH1.style.display = 'block';
    document.getElementById('budgetTrackerContainer').style.display = 'none';
    document.getElementById('projectsMenu').style.display = 'grid';
    document.getElementById('budgetResult').style.display = 'none';
}

let bills = [];
let deductions1 = [];
let deductions2 = [];
let saveInputsEnabled = localStorage.getItem('budgetSaveInputs') === 'true' || false;

function toggleSaveInputs() {
    saveInputsEnabled = !saveInputsEnabled;
    localStorage.setItem('budgetSaveInputs', saveInputsEnabled.toString());
    
    const btn = document.getElementById('saveInputsBtn');
    if (saveInputsEnabled) {
        btn.classList.add('active');
        btn.innerHTML = '💾 Saving Inputs';
        // If we have previously saved data, load it; otherwise, save current inputs
        const savedData = localStorage.getItem('budgetTrackerInputs');
        if (savedData) {
            loadSavedInputs(true);
        } else {
            saveAllInputs();
        }
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '💾 Save Inputs';
        clearSavedInputs();
    }
}

function saveAllInputs() {
    if (!saveInputsEnabled) return;
    
    const inputData = {
        // People count
        peopleCount: document.querySelector('input[name="peopleCount"]:checked')?.value || 'one',
        
        // Person 1 data
        salary1: document.getElementById('salary1')?.value || '',
        selfEmployed1: document.getElementById('selfEmployed1')?.checked || false,
        payFrequency1: document.getElementById('payFrequency1')?.value || 'bi-weekly',
        retirementToggle1: document.getElementById('retirementToggle1')?.checked || false,
        retirement401kType1: document.querySelector('input[name="retirement401kType1"]:checked')?.value || 'traditional',
        retirementType1: document.querySelector('input[name="retirementType1"]:checked')?.value || 'percentage',
        retirement1: document.getElementById('retirement1')?.value || '',
        iraToggle1: document.getElementById('iraToggle1')?.checked || false,
        iraType1: document.querySelector('input[name="iraType1"]:checked')?.value || 'traditional',
        ira1: document.getElementById('ira1')?.value || '',
        hsaToggle1: document.getElementById('hsaToggle1')?.checked || false,
        hsa1: document.getElementById('hsa1')?.value || '',
        otherDeductionsToggle1: document.getElementById('otherDeductionsToggle1')?.checked || false,
        
        // Person 2 data
        salary2: document.getElementById('salary2')?.value || '',
        selfEmployed2: document.getElementById('selfEmployed2')?.checked || false,
        payFrequency2: document.getElementById('payFrequency2')?.value || 'bi-weekly',
        retirementToggle2: document.getElementById('retirementToggle2')?.checked || false,
        retirement401kType2: document.querySelector('input[name="retirement401kType2"]:checked')?.value || 'traditional',
        retirementType2: document.querySelector('input[name="retirementType2"]:checked')?.value || 'percentage',
        retirement2: document.getElementById('retirement2')?.value || '',
        iraToggle2: document.getElementById('iraToggle2')?.checked || false,
        iraType2: document.querySelector('input[name="iraType2"]:checked')?.value || 'traditional',
        ira2: document.getElementById('ira2')?.value || '',
        hsaToggle2: document.getElementById('hsaToggle2')?.checked || false,
        hsa2: document.getElementById('hsa2')?.value || '',
        otherDeductionsToggle2: document.getElementById('otherDeductionsToggle2')?.checked || false,
        
        // Global data
        filingStatus: document.getElementById('filingStatus')?.value || 'single',
        taxYear: document.getElementById('taxYear')?.value || '2025',
        stateTax: document.getElementById('stateTax')?.value || '',
        socialSecurityRate1: document.getElementById('socialSecurityRate1')?.value || '6.2',
        medicareRate1: document.getElementById('medicareRate1')?.value || '1.45',
        federalWithholding1: document.getElementById('federalWithholding1')?.value || '',
        socialSecurityRate2: document.getElementById('socialSecurityRate2')?.value || '6.2',
        medicareRate2: document.getElementById('medicareRate2')?.value || '1.45',
        federalWithholding2: document.getElementById('federalWithholding2')?.value || '',
        billCategory: document.getElementById('billCategory')?.value || 'need',
    bills: bills,
    deductions1: deductions1,
    deductions2: deductions2,
    // UI state
    chartPeriod: document.getElementById('chartPeriod')?.value || 'monthly',
    detailChartPeriod: document.getElementById('detailChartPeriod')?.value || 'monthly'
    };
    
    localStorage.setItem('budgetTrackerInputs', JSON.stringify(inputData));
}

function loadSavedInputs(force = false) {
    // Only auto-load when the Save Inputs toggle is enabled, unless forced
    if (!force && !saveInputsEnabled) return;
    const savedData = localStorage.getItem('budgetTrackerInputs');
    if (!savedData) return;
    
    try {
        const inputData = JSON.parse(savedData);
        
        // Load people count
        const peopleRadio = document.querySelector(`input[name="peopleCount"][value="${inputData.peopleCount}"]`);
        if (peopleRadio) {
            peopleRadio.checked = true;
            togglePeopleCount(inputData.peopleCount);
        }
        
        // Load Person 1 data
        if (inputData.salary1) document.getElementById('salary1').value = inputData.salary1;
    document.getElementById('selfEmployed1').checked = inputData.selfEmployed1;
    updateSelfEmploymentRates('1');
        if (inputData.payFrequency1) document.getElementById('payFrequency1').value = inputData.payFrequency1;
        document.getElementById('retirementToggle1').checked = inputData.retirementToggle1;
        toggleInput('retirementToggle1', 'retirementGroup1');
        
        const retirement401kType1 = document.querySelector(`input[name="retirement401kType1"][value="${inputData.retirement401kType1}"]`);
        if (retirement401kType1) retirement401kType1.checked = true;
        
        const retirementType1 = document.querySelector(`input[name="retirementType1"][value="${inputData.retirementType1}"]`);
        if (retirementType1) retirementType1.checked = true;
        updateRetirementType('1', inputData.retirementType1);
        
        if (inputData.retirement1) document.getElementById('retirement1').value = inputData.retirement1;
        
        document.getElementById('iraToggle1').checked = inputData.iraToggle1;
        toggleInput('iraToggle1', 'iraGroup1');
        
        const iraType1 = document.querySelector(`input[name="iraType1"][value="${inputData.iraType1}"]`);
        if (iraType1) iraType1.checked = true;
        
        if (inputData.ira1) document.getElementById('ira1').value = inputData.ira1;
        
        document.getElementById('hsaToggle1').checked = inputData.hsaToggle1;
        toggleInput('hsaToggle1', 'hsaGroup1');
        if (inputData.hsa1) document.getElementById('hsa1').value = inputData.hsa1;
        
        document.getElementById('otherDeductionsToggle1').checked = inputData.otherDeductionsToggle1;
        toggleInput('otherDeductionsToggle1', 'otherDeductionsGroup1');
        
        // Load Person 2 data (similar pattern)
        if (inputData.salary2) document.getElementById('salary2').value = inputData.salary2;
    document.getElementById('selfEmployed2').checked = inputData.selfEmployed2;
    updateSelfEmploymentRates('2');
        if (inputData.payFrequency2) document.getElementById('payFrequency2').value = inputData.payFrequency2;
        document.getElementById('retirementToggle2').checked = inputData.retirementToggle2;
        toggleInput('retirementToggle2', 'retirementGroup2');
        
        const retirement401kType2 = document.querySelector(`input[name="retirement401kType2"][value="${inputData.retirement401kType2}"]`);
        if (retirement401kType2) retirement401kType2.checked = true;
        
        const retirementType2 = document.querySelector(`input[name="retirementType2"][value="${inputData.retirementType2}"]`);
        if (retirementType2) retirementType2.checked = true;
        updateRetirementType('2', inputData.retirementType2);
        
        if (inputData.retirement2) document.getElementById('retirement2').value = inputData.retirement2;
        
        document.getElementById('iraToggle2').checked = inputData.iraToggle2;
        toggleInput('iraToggle2', 'iraGroup2');
        
        const iraType2 = document.querySelector(`input[name="iraType2"][value="${inputData.iraType2}"]`);
        if (iraType2) iraType2.checked = true;
        
        if (inputData.ira2) document.getElementById('ira2').value = inputData.ira2;
        
        document.getElementById('hsaToggle2').checked = inputData.hsaToggle2;
        toggleInput('hsaToggle2', 'hsaGroup2');
        if (inputData.hsa2) document.getElementById('hsa2').value = inputData.hsa2;
        
        document.getElementById('otherDeductionsToggle2').checked = inputData.otherDeductionsToggle2;
        toggleInput('otherDeductionsToggle2', 'otherDeductionsGroup2');
        
        // Load global data
        if (inputData.filingStatus) document.getElementById('filingStatus').value = inputData.filingStatus;
        if (inputData.taxYear) document.getElementById('taxYear').value = inputData.taxYear;
        if (inputData.stateTax) document.getElementById('stateTax').value = inputData.stateTax;
        if (inputData.socialSecurityRate1) document.getElementById('socialSecurityRate1').value = inputData.socialSecurityRate1;
        if (inputData.medicareRate1) document.getElementById('medicareRate1').value = inputData.medicareRate1;
        if (inputData.federalWithholding1) document.getElementById('federalWithholding1').value = inputData.federalWithholding1;
        if (inputData.socialSecurityRate2) document.getElementById('socialSecurityRate2').value = inputData.socialSecurityRate2;
        if (inputData.medicareRate2) document.getElementById('medicareRate2').value = inputData.medicareRate2;
        if (inputData.federalWithholding2) document.getElementById('federalWithholding2').value = inputData.federalWithholding2;
        
    // Load bill category
        if (inputData.billCategory) document.getElementById('billCategory').value = inputData.billCategory;
        
        // Load bills
        if (inputData.bills && Array.isArray(inputData.bills)) {
            bills = inputData.bills;
            updateBillsList();
        }
        
        // Load deductions
        if (inputData.deductions1 && Array.isArray(inputData.deductions1)) {
            deductions1 = inputData.deductions1;
            updateDeductionsList(1);
        }
        
        if (inputData.deductions2 && Array.isArray(inputData.deductions2)) {
            deductions2 = inputData.deductions2;
            updateDeductionsList(2);
        }
        
        // Restore period selectors if saved (do this before recalculation)
        if (inputData.chartPeriod) {
            const chartPeriodEl = document.getElementById('chartPeriod');
            if (chartPeriodEl) chartPeriodEl.value = inputData.chartPeriod;
        }
        if (inputData.detailChartPeriod) {
            const detailPeriodEl = document.getElementById('detailChartPeriod');
            if (detailPeriodEl) detailPeriodEl.value = inputData.detailChartPeriod;
        }

        // Recalculate budget after loading all data
        calculateBudget();
        // After loading, persist the normalized state if saving is enabled
        if (saveInputsEnabled) {
            saveAllInputs();
        }
        
    } catch (error) {
        console.error('Error loading saved inputs:', error);
    }
}

function clearSavedInputs() {
    localStorage.removeItem('budgetTrackerInputs');
}

// Add event listeners to save inputs when they change
let saveDebounceTimer;
function addInputChangeListeners() {
    // Always add listeners, saveAllInputs will check if saving is enabled
    const inputs = document.querySelectorAll('#budgetTrackerContainer input, #budgetTrackerContainer select');
    inputs.forEach(input => {
        // Remove existing listeners to avoid duplicates
        input.removeEventListener('change', saveAllInputs);
        input.removeEventListener('input', saveAllInputs);
        // Add new listeners
        input.addEventListener('change', () => {
            clearTimeout(saveDebounceTimer);
            saveDebounceTimer = setTimeout(saveAllInputs, 150);
        });
        input.addEventListener('input', () => {
            clearTimeout(saveDebounceTimer);
            saveDebounceTimer = setTimeout(saveAllInputs, 150);
        });
    });
}

function addBill() {
    const billName = document.getElementById('billName').value.trim();
    const billAmount = parseFloat(document.getElementById('billAmount').value) || 0;
    const billCategory = document.getElementById('billCategory').value;
    
    if (billName && billAmount > 0) {
        bills.push({ name: billName, amount: billAmount, category: billCategory });
        updateBillsList();
        saveAllInputs();
        calculateBudget(); // Auto-calculate when bill is added
        
        // Clear inputs
        document.getElementById('billName').value = '';
        document.getElementById('billAmount').value = '';
        document.getElementById('billCategory').value = 'need'; // Reset to default
    }
}

function addPresetBill(billName, category) {
    const billNameInput = document.getElementById('billName');
    const billCategorySelect = document.getElementById('billCategory');
    
    // Populate the bill name and category
    billNameInput.value = billName;
    billCategorySelect.value = category;
    
    // Focus on the amount field for user to enter
    const billAmountInput = document.getElementById('billAmount');
    billAmountInput.focus();
}

function removeBill(index) {
    bills.splice(index, 1);
    updateBillsList();
    saveAllInputs();
    calculateBudget(); // Auto-calculate when bill is removed
}

function updateBillsList() {
    const billsList = document.getElementById('billsList');
    const totalBills = document.getElementById('totalBills');
    
    if (!billsList || !totalBills) {
        return;
    }
    
    if (bills.length === 0) {
        billsList.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; min-height: 60px;"><p style="color: #666; font-style: italic; margin: 0; text-align: center;">No bills added yet</p></div>';
    } else {
        billsList.innerHTML = bills.map((bill, index) => {
            const category = bill.category || 'need'; // Default to 'need' for backward compatibility
            const categoryColor = category === 'need' ? '#28a745' : '#ffc107';
            const categoryText = category === 'need' ? 'Need' : 'Want';
            return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.3); border-radius: 6px; margin-bottom: 8px; border: 1px solid rgba(0,0,0,0.05);">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <span style="font-weight: 500;">${bill.name}</span>
                    <span style="font-size: 12px; color: ${categoryColor}; font-weight: 600;">${categoryText}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-weight: bold; color: #333;">$${bill.amount.toFixed(2)}</span>
                    <button onclick="removeBill(${index})" style="padding: 4px 8px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">×</button>
                </div>
            </div>
            `;
        }).join('');
    }
    
    const total = bills.reduce((sum, bill) => sum + bill.amount, 0);
    totalBills.textContent = `$${total.toFixed(2)}`;
}

function handleBillKeypress(event) {
    if (event.key === 'Enter') {
        addBill();
    }
}

// Deduction management functions
function addDeduction(person) {
    const deductionNameInput = document.getElementById(`deductionName${person}`);
    const deductionAmountInput = document.getElementById(`deductionAmount${person}`);
    const deductionTypeSelect = document.getElementById(`deductionType${person}`);
    
    const deductionName = deductionNameInput.value.trim();
    const deductionAmount = parseFloat(deductionAmountInput.value) || 0;
    const deductionType = deductionTypeSelect.value;
    
    if (deductionName && deductionAmount > 0) {
        const deductionsArray = person === 1 ? deductions1 : deductions2;
        deductionsArray.push({ 
            name: deductionName, 
            amount: deductionAmount, 
            type: deductionType 
        });
        
        updateDeductionsList(person);
        saveAllInputs();
        calculateBudget(); // Auto-calculate when deduction is added
        
        // Clear inputs
        deductionNameInput.value = '';
        deductionAmountInput.value = '';
        deductionTypeSelect.value = 'pre-tax';
    }
}

function addPresetDeduction(person, name, type) {
    const deductionNameInput = document.getElementById(`deductionName${person}`);
    const deductionTypeSelect = document.getElementById(`deductionType${person}`);
    
    deductionNameInput.value = name;
    deductionTypeSelect.value = type;
    deductionNameInput.focus();
}

function removeDeduction(person, index) {
    const deductionsArray = person === 1 ? deductions1 : deductions2;
    deductionsArray.splice(index, 1);
    updateDeductionsList(person);
    saveAllInputs();
    calculateBudget(); // Auto-calculate when deduction is removed
}

function updateDeductionsList(person) {
    const deductionsArray = person === 1 ? deductions1 : deductions2;
    const deductionsList = document.getElementById(`deductionsList${person}`);
    const deductionsTotal = document.getElementById(`deductionsTotal${person}`);
    
    if (deductionsArray.length === 0) {
        deductionsList.innerHTML = '<p style="text-align: center; color: #666; margin: 20px 0;">No deductions added yet</p>';
    } else {
        deductionsList.innerHTML = deductionsArray.map((deduction, index) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.1);">
                <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 500; color: #333;">${deduction.name}</span>
                    <span style="font-size: 12px; color: #666; text-transform: capitalize;">${deduction.type}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-weight: bold; color: #333;">$${deduction.amount.toFixed(2)}</span>
                    <button onclick="removeDeduction(${person}, ${index})" style="padding: 4px 8px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">×</button>
                </div>
            </div>
        `).join('');
    }
    
    const total = deductionsArray.reduce((sum, deduction) => sum + deduction.amount, 0);
    deductionsTotal.textContent = total.toFixed(2);
}

function handleDeductionKeypress(event, person) {
    if (event.key === 'Enter') {
        addDeduction(person);
    }
}

function updateRetirementType(person, type) {
    const label = document.getElementById(`retirementLabel${person}`);
    const input = document.getElementById(`retirement${person}`);
    
    if (type === 'fixed') {
        label.textContent = 'Contribution ($ per check):';
        input.placeholder = 'e.g., 200';
    } else {
        label.textContent = 'Contribution (% of Gross):';
        input.placeholder = 'e.g., 5';
    }
    
    // Clear the input when switching types
    input.value = '';
    
    // Auto-calculate when retirement type changes
    calculateBudget();
}

function updateIRAType(person, type) {
    // This function can be used for future enhancements
    // Currently both types use the same input handling
    
    // Auto-calculate when IRA type changes
    calculateBudget();
}

function update401kType(person, type) {
    // This function can be used for future enhancements
    // Currently both types use the same input handling
    
    // Auto-calculate when 401k type changes
    calculateBudget();
}

function toggleTwoPeople() {
    const twoPeople = document.getElementById('twoPeopleToggle').checked;
    const container = document.getElementById('budgetTrackerContainer');
    document.getElementById('person2Inputs').style.display = twoPeople ? 'block' : 'none';
    // Toggle a class for CSS-driven layout
    if (container) {
        container.classList.toggle('two-people', twoPeople);
    }
}

function togglePeopleCount(value) {
    const twoPeople = value === 'two';
    const container = document.getElementById('budgetTrackerContainer');
    document.getElementById('person2Inputs').style.display = twoPeople ? 'block' : 'none';
    // Toggle a class for CSS-driven layout
    if (container) {
        container.classList.toggle('two-people', twoPeople);
    }
    
    // Update results box mode classes so CSS can size correctly
    const budgetResult = document.getElementById('budgetResult');
    if (budgetResult) {
        budgetResult.classList.toggle('two-people', twoPeople);
        budgetResult.classList.toggle('one-person', !twoPeople);
    }    // Update calculation box base width to match container when not expanded
    updateCalculationBoxWidth(twoPeople);
    
    // Auto-calculate when people count changes
    calculateBudget();
}

function updateCalculationBoxWidth(twoPeople) {
    const budgetResult = document.getElementById('budgetResult');
    const billsContainer = document.querySelector('.input-group.full-width');
    
    if (budgetResult && billsContainer) {
        // Match bills container width for consistent alignment
        const billsWidth = billsContainer.getBoundingClientRect().width;
        budgetResult.style.width = `${billsWidth}px`;
        budgetResult.style.maxWidth = '95vw';
    }
}function updateHSALimits(twoPeople) {
    // This function is no longer needed since each person has their own HSA
    // Keep it for backwards compatibility but it does nothing
}

function toggleInput(toggleId, groupId) {
    const toggle = document.getElementById(toggleId);
    const group = document.getElementById(groupId);
    
    if (toggle.checked) {
        group.style.display = 'block';
    } else {
        group.style.display = 'none';
        // Clear inputs when hiding the group
        const inputs = group.querySelectorAll('input[type="number"]');
        inputs.forEach(input => input.value = '');
    }
    
    // Auto-calculate when toggling sections
    calculateBudget();
}

function calculateBudget() {
    const filingStatus = document.getElementById('filingStatus').value;
    const taxYear = document.getElementById('taxYear').value;
    const peopleCountRadio = document.querySelector('input[name="peopleCount"]:checked');
    const twoPeople = peopleCountRadio && peopleCountRadio.value === 'two';
    const stateTaxRate = parseFloat(document.getElementById('stateTax').value) || 0;
    const billsTotal = bills.reduce((sum, bill) => sum + bill.amount, 0);

    let totalGrossAnnual = 0;
    let totalTraditional401kAnnual = 0;
    let totalRoth401kAnnual = 0;
    let totalTraditionalIrAAnnual = 0;
    let totalRothIrAAnnual = 0;
    let totalHsaAnnual = 0;
    let totalOtherDeductionsAnnual = 0;

    function getPersonData(person) {
        const salary = parseFloat(document.getElementById(`salary${person}`).value) || 0;
        const isSelfEmployed = document.getElementById(`selfEmployed${person}`).checked;
        const payFrequency = document.getElementById(`payFrequency${person}`).value;
        const socialSecurityRate = parseFloat(document.getElementById(`socialSecurityRate${person}`).value) || 6.2;
        const medicareRate = parseFloat(document.getElementById(`medicareRate${person}`).value) || 1.45;
        const federalWithholdingPerPaycheck = parseFloat(document.getElementById(`federalWithholding${person}`).value) || 0;
        
        let payPeriods;
        if (payFrequency === 'weekly') payPeriods = 52;
        else if (payFrequency === 'bi-weekly') payPeriods = 26;
        else payPeriods = 12;

        const grossPayPerCheck = salary / payPeriods;
        let traditional401kPerCheck = 0;
        let roth401kPerCheck = 0;
        let hsaAnnual = 0;
        let traditionalIrAAnnual = 0;
        let rothIrAAnnual = 0;
        let otherDeductionsAnnual = 0;
        let postTaxDeductionsAnnual = 0;

        // 401k/Retirement handling
        if (document.getElementById(`retirementToggle${person}`).checked) {
            const retirementValue = parseFloat(document.getElementById(`retirement${person}`).value) || 0;
            const retirementTypeRadio = document.querySelector(`input[name="retirementType${person}"]:checked`);
            const isFixedAmount = retirementTypeRadio && retirementTypeRadio.value === 'fixed';
            const retirement401kTypeRadio = document.querySelector(`input[name="retirement401kType${person}"]:checked`);
            const isTraditional401k = retirement401kTypeRadio && retirement401kTypeRadio.value === 'traditional';
            
            let retirementPerCheck = 0;
            if (isFixedAmount) {
                retirementPerCheck = retirementValue;
            } else {
                retirementPerCheck = grossPayPerCheck * (retirementValue / 100);
            }
            
            if (isTraditional401k) {
                traditional401kPerCheck = retirementPerCheck;
            } else {
                roth401kPerCheck = retirementPerCheck;
            }
        }

        // IRA handling
        if (document.getElementById(`iraToggle${person}`).checked) {
            const iraValue = parseFloat(document.getElementById(`ira${person}`).value) || 0;
            const iraTypeRadio = document.querySelector(`input[name="iraType${person}"]:checked`);
            const isTraditional = iraTypeRadio && iraTypeRadio.value === 'traditional';
            
            if (isTraditional) {
                traditionalIrAAnnual = iraValue;
            } else {
                rothIrAAnnual = iraValue; // Roth is after-tax, won't reduce taxable income
            }
        }

        // HSA handling
        if (document.getElementById(`hsaToggle${person}`).checked) {
            hsaAnnual = parseFloat(document.getElementById(`hsa${person}`).value) || 0;
        }

        // Other deductions handling (new itemized system)
        if (document.getElementById(`otherDeductionsToggle${person}`).checked) {
            const deductionsArray = person === '1' ? deductions1 : deductions2;
            const preTaxDeductions = deductionsArray.filter(d => d.type === 'pre-tax');
            const postTaxDeductions = deductionsArray.filter(d => d.type === 'post-tax');
            
            // Pre-tax deductions (reduce taxable income)
            const preTaxDeductionsPerCheck = preTaxDeductions.reduce((sum, d) => sum + d.amount, 0);
            otherDeductionsAnnual = preTaxDeductionsPerCheck * payPeriods;
            
            // Post-tax deductions (don't reduce taxable income, but reduce net income)
            const postTaxDeductionsPerCheck = postTaxDeductions.reduce((sum, d) => sum + d.amount, 0);
            postTaxDeductionsAnnual = postTaxDeductionsPerCheck * payPeriods;
        }
        
        return { 
            postTaxDeductionsAnnual, 
            isSelfEmployed, 
            salary,
            socialSecurityRate,
            medicareRate,
            grossAnnual: salary,
            traditional401kAnnual: traditional401kPerCheck * payPeriods,
            roth401kAnnual: roth401kPerCheck * payPeriods,
            traditionalIrAAnnual: traditionalIrAAnnual,
            rothIrAAnnual: rothIrAAnnual,
            hsaAnnual: hsaAnnual,
            otherDeductionsAnnual: otherDeductionsAnnual,
            federalWithholdingAnnual: federalWithholdingPerPaycheck * payPeriods
        };
    }

    const person1Data = getPersonData('1');
    let person2Data = { postTaxDeductionsAnnual: 0, isSelfEmployed: false, salary: 0, grossAnnual: 0, traditional401kAnnual: 0, roth401kAnnual: 0, traditionalIrAAnnual: 0, rothIrAAnnual: 0, hsaAnnual: 0, otherDeductionsAnnual: 0, federalWithholdingAnnual: 0 };
    if (twoPeople) {
        person2Data = getPersonData('2');
    }

    // Accumulate totals from both persons
    totalGrossAnnual = person1Data.grossAnnual + person2Data.grossAnnual;
    totalTraditional401kAnnual = person1Data.traditional401kAnnual + person2Data.traditional401kAnnual;
    totalRoth401kAnnual = person1Data.roth401kAnnual + person2Data.roth401kAnnual;
    totalTraditionalIrAAnnual = person1Data.traditionalIrAAnnual + person2Data.traditionalIrAAnnual;
    totalRothIrAAnnual = person1Data.rothIrAAnnual + person2Data.rothIrAAnnual;
    totalHsaAnnual = person1Data.hsaAnnual + person2Data.hsaAnnual;
    totalOtherDeductionsAnnual = person1Data.otherDeductionsAnnual + person2Data.otherDeductionsAnnual;
    
    // Calculate total federal withholding
    const totalFederalWithholdingAnnual = person1Data.federalWithholdingAnnual + person2Data.federalWithholdingAnnual;
    
    const totalPostTaxDeductionsAnnual = person1Data.postTaxDeductionsAnnual + person2Data.postTaxDeductionsAnnual;

    const totalPreTaxDeductionsAnnual = totalTraditional401kAnnual + totalTraditionalIrAAnnual + totalHsaAnnual + totalOtherDeductionsAnnual;
    
    // Tax year-specific limits
    const taxYearData = {
        2025: {
            socialSecurityWageBase: 168600,
            singleBrackets: {
                11925: 0.10,
                48475: 0.12,
                103350: 0.22,
                197300: 0.24,
                250525: 0.32,
                626350: 0.35,
                Infinity: 0.37
            },
            marriedBrackets: {
                23850: 0.10,
                96950: 0.12,
                206700: 0.22,
                394600: 0.24,
                501050: 0.32,
                751600: 0.35,
                Infinity: 0.37
            },
            additionalMedicareThreshold: { single: 200000, married: 250000 },
            // Standard deduction (approximate; adjust per IRS values for year/status)
            standardDeduction: { single: 15000, married: 30000 }
        },
        2024: {
            socialSecurityWageBase: 160200,
            singleBrackets: {
                11600: 0.10,
                47150: 0.12,
                100525: 0.22,
                191750: 0.24,
                243725: 0.32,
                609350: 0.35,
                Infinity: 0.37
            },
            marriedBrackets: {
                23200: 0.10,
                94300: 0.12,
                201050: 0.22,
                383500: 0.24,
                487450: 0.32,
                731200: 0.35,
                Infinity: 0.37
            },
            additionalMedicareThreshold: { single: 200000, married: 250000 },
            standardDeduction: { single: 15000, married: 30000 }
        }
    };
    
    const currentYearData = taxYearData[taxYear] || taxYearData['2025'];
    const socialSecurityWageBase = currentYearData.socialSecurityWageBase;
    const filingKey = filingStatus === 'married' ? 'married' : 'single';
    const standardDeduction = (currentYearData.standardDeduction && currentYearData.standardDeduction[filingKey]) || 0;
    const taxableIncomeAnnual = Math.max(0, totalGrossAnnual - totalPreTaxDeductionsAnnual - standardDeduction);
    
    // Calculate Social Security and Medicare taxes, considering self-employment
    let socialSecurityTax = 0;
    let medicareTax = 0;
    
    // Person 1 taxes - apply to salary minus pre-tax deductions
    const person1SocialSecurityRate = person1Data.socialSecurityRate / 100;
    const person1MedicareRate = person1Data.medicareRate / 100;
    const person1TaxableWages = person1Data.salary - person1Data.traditional401kAnnual - person1Data.traditionalIrAAnnual - person1Data.hsaAnnual - person1Data.otherDeductionsAnnual;
    // Apply Social Security wage base per person to taxable wages
    const person1SSWages = Math.min(person1TaxableWages, socialSecurityWageBase);
    // Use the rate inputs directly; UI reflects self-employed doubling when toggled
    socialSecurityTax += person1SSWages * person1SocialSecurityRate;
    medicareTax += person1TaxableWages * person1MedicareRate;

    // Initialize person2 taxable wages for later use
    let person2TaxableWages = 0;
    
    // Person 2 taxes (if applicable) - apply to salary minus pre-tax deductions
    if (twoPeople && person2Data.salary > 0) {
        const person2SocialSecurityRate = person2Data.socialSecurityRate / 100;
        const person2MedicareRate = person2Data.medicareRate / 100;
        person2TaxableWages = person2Data.salary - person2Data.traditional401kAnnual - person2Data.traditionalIrAAnnual - person2Data.hsaAnnual - person2Data.otherDeductionsAnnual;
        // Apply Social Security wage base per person to taxable wages
        const person2SSWages = Math.min(person2TaxableWages, socialSecurityWageBase);
        // Use the rate inputs directly; UI reflects self-employed doubling when toggled
        socialSecurityTax += person2SSWages * person2SocialSecurityRate;
        medicareTax += person2TaxableWages * person2MedicareRate;
    }
    
    // Additional Medicare tax for high earners (0.9% on income over threshold)
    let additionalMedicareTax = 0;
    const thresholdKey = filingKey;
    const additionalMedicareThreshold = currentYearData.additionalMedicareThreshold[thresholdKey];
    const totalTaxableWages = (person1TaxableWages || 0) + (person2TaxableWages || 0);
    if (totalTaxableWages > additionalMedicareThreshold) {
        additionalMedicareTax = (totalTaxableWages - additionalMedicareThreshold) * 0.009;
    }

    // Federal Tax Calculation (using year-specific brackets)
    let federalTaxesAnnual = 0;
    const brackets = filingStatus === 'single' ? currentYearData.singleBrackets : currentYearData.marriedBrackets;
    let remainingIncome = Math.max(0, taxableIncomeAnnual);
    
    // Convert brackets object to sorted array for proper iteration
    const bracketArray = Object.entries(brackets).map(([limit, rate]) => ({
        limit: parseFloat(limit),
        rate: parseFloat(rate)
    })).sort((a, b) => a.limit - b.limit);
    
    let previousLimit = 0;
    for (const bracket of bracketArray) {
        if (remainingIncome <= 0) break;
        
        const bracketWidth = bracket.limit === Infinity ? Infinity : bracket.limit - previousLimit;
        const taxableInThisBracket = Math.min(remainingIncome, bracketWidth);
        
        federalTaxesAnnual += taxableInThisBracket * bracket.rate;
        remainingIncome -= taxableInThisBracket;
        previousLimit = bracket.limit;
        
        if (bracket.limit === Infinity || remainingIncome <= 0) break;
    }

    // Calculate total taxes
    const stateTaxesAnnual = Math.max(0, taxableIncomeAnnual * (stateTaxRate / 100));
    const totalPayrollTaxes = socialSecurityTax + medicareTax + additionalMedicareTax;
    // Use federal withholding if entered, otherwise use calculated federal tax
    const federalTaxForBudget = totalFederalWithholdingAnnual > 0 ? totalFederalWithholdingAnnual : federalTaxesAnnual;
    const totalTaxesAnnual = federalTaxForBudget + stateTaxesAnnual + totalPayrollTaxes;
    
    // Calculate final take-home pay (gross - pre-tax deductions - taxes - post-tax deductions - Roth contributions)
    const totalRothContributions = totalRoth401kAnnual + totalRothIrAAnnual;
    const netIncomeAnnual = totalGrossAnnual - totalPreTaxDeductionsAnnual - totalTaxesAnnual - totalPostTaxDeductionsAnnual - totalRothContributions;
    const netMonthlyIncome = netIncomeAnnual / 12;
    const remainingAfterBills = netMonthlyIncome - billsTotal;

    // Display results in the new four-column format
    const grossPayWeekly = totalGrossAnnual / 52;
    const grossPayBiWeekly = totalGrossAnnual / 26;
    const grossPayMonthly = totalGrossAnnual / 12;
    
    const deductionsWeekly = totalPreTaxDeductionsAnnual / 52;
    const deductionsBiWeekly = totalPreTaxDeductionsAnnual / 26;
    const deductionsMonthly = totalPreTaxDeductionsAnnual / 12;
    
    const taxesWeekly = totalTaxesAnnual / 52;
    const taxesBiWeekly = totalTaxesAnnual / 26;
    const taxesMonthly = totalTaxesAnnual / 12;
    
    const takeHomeWeekly = netIncomeAnnual / 52;
    const takeHomeBiWeekly = netIncomeAnnual / 26;
    const takeHomeMonthly = netIncomeAnnual / 12;
    
    // Weekly column
    document.getElementById('grossPayWeekly').textContent = `$${grossPayWeekly.toFixed(2)}`;
    document.getElementById('deductionsWeekly').textContent = `$${deductionsWeekly.toFixed(2)}`;
    document.getElementById('taxesWeekly').textContent = `$${taxesWeekly.toFixed(2)}`;
    document.getElementById('takeHomeWeekly').textContent = `$${takeHomeWeekly.toFixed(2)}`;
    
    // Bi-weekly column
    document.getElementById('grossPayBiWeekly').textContent = `$${grossPayBiWeekly.toFixed(2)}`;
    document.getElementById('deductionsBiWeekly').textContent = `$${deductionsBiWeekly.toFixed(2)}`;
    document.getElementById('taxesBiWeekly').textContent = `$${taxesBiWeekly.toFixed(2)}`;
    document.getElementById('takeHomeBiWeekly').textContent = `$${takeHomeBiWeekly.toFixed(2)}`;
    
    // Monthly column
    document.getElementById('grossPayMonthly').textContent = `$${grossPayMonthly.toFixed(2)}`;
    document.getElementById('deductionsMonthly').textContent = `$${deductionsMonthly.toFixed(2)}`;
    document.getElementById('taxesMonthly').textContent = `$${taxesMonthly.toFixed(2)}`;
    document.getElementById('takeHomeMonthly').textContent = `$${takeHomeMonthly.toFixed(2)}`;
    
    // Annual column
    document.getElementById('grossPayYearly').textContent = `$${totalGrossAnnual.toFixed(2)}`;
    document.getElementById('deductionsYearly').textContent = `$${totalPreTaxDeductionsAnnual.toFixed(2)}`;
    document.getElementById('taxesYearly').textContent = `$${totalTaxesAnnual.toFixed(2)}`;
    document.getElementById('takeHomeYearly').textContent = `$${netIncomeAnnual.toFixed(2)}`;
    
    // Update income breakdown chart (make remaining = net after bills so all segments sum to gross)
    const annualBills = billsTotal * 12;
    const remainingAfterBillsAnnual = Math.max(0, netIncomeAnnual - annualBills);
    // Use federal withholding if entered, otherwise use calculated federal tax for display
    const federalTaxForChart = totalFederalWithholdingAnnual > 0 ? totalFederalWithholdingAnnual : federalTaxesAnnual;
    updateIncomeBreakdownChart(
        totalGrossAnnual, 
        federalTaxForChart, 
        stateTaxesAnnual, 
        totalPayrollTaxes, 
        totalPreTaxDeductionsAnnual, 
        totalPostTaxDeductionsAnnual + totalRothContributions, 
        annualBills, 
        remainingAfterBillsAnnual,
        {
            totalGrossAnnual: totalGrossAnnual,
            totalPreTaxDeductionsAnnual: totalPreTaxDeductionsAnnual,
            totalTraditional401kAnnual: totalTraditional401kAnnual,
            totalTraditionalIrAAnnual: totalTraditionalIrAAnnual,
            totalHsaAnnual: totalHsaAnnual,
            totalOtherDeductionsAnnual: totalOtherDeductionsAnnual,
            totalRoth401kAnnual: totalRoth401kAnnual,
            totalRothIrAAnnual: totalRothIrAAnnual,
            // Provide detailed payroll tax components for accurate breakdowns
            socialSecurityTax: socialSecurityTax,
            medicareTax: medicareTax,
            additionalMedicareTax: additionalMedicareTax
        }
    );

    const budgetResult = document.getElementById('budgetResult');
    if (document.getElementById('budgetTrackerContainer').style.display !== 'none') {
        budgetResult.style.display = 'block';
    }
}

function updateLegendLabels(periodLabel) {
    // Safely update only the text node (label) so the value <span id="legend..."> remains intact
    const legendTexts = document.querySelectorAll('.chart-legend .legend-item .legend-text');
    legendTexts.forEach(legendText => {
        // Find the first text node (usually contains "Label: $")
        let textNode = null;
        for (const node of legendText.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                textNode = node;
                break;
            }
        }

        if (!textNode) return;

        const original = textNode.nodeValue || '';
        const colonIndex = original.indexOf(':');
        // Extract the label before the colon; default to whole text if missing
        const labelPart = colonIndex > -1 ? original.substring(0, colonIndex) : original;
        // Clean any existing period annotation
        const cleanLabel = labelPart.replace(/ \(.*?\)/, '').trim();

        // Build new label text including colon and dollar sign before the value span
        const prefix = periodLabel && periodLabel !== 'Monthly'
            ? `${cleanLabel} (${periodLabel}): $`
            : `${cleanLabel}: $`;

        textNode.nodeValue = prefix;
    });
}

// Period conversion functions
function convertToPeriod(annualAmount, period) {
    switch(period) {
        case 'weekly':
            return annualAmount / 52;
        case 'bi-weekly':
            return annualAmount / 26;
        case 'monthly':
            return annualAmount / 12;
        case 'annually':
            return annualAmount;
        default:
            return annualAmount / 12; // Default to monthly
    }
}

function getPeriodLabel(period) {
    switch(period) {
        case 'weekly':
            return 'Weekly';
        case 'bi-weekly':
            return 'Bi-weekly';
        case 'monthly':
            return 'Monthly';
        case 'annually':
            return 'Annual';
        default:
            return 'Monthly';
    }
}

function updateIncomeBreakdownChart(grossAnnual, federalTax, stateTax, payrollTax, preDeductions, postDeductions, annualBills, remaining, additionalData = {}) {
    // Calculate percentages for each segment
    if (grossAnnual <= 0) return;
    
    // Get current period selection
    const period = document.getElementById('chartPeriod')?.value || 'monthly';
    const periodLabel = getPeriodLabel(period);
    
    const federalPct = (federalTax / grossAnnual) * 100;
    const statePct = (stateTax / grossAnnual) * 100;
    const payrollPct = (payrollTax / grossAnnual) * 100;
    const preDeductionsPct = (preDeductions / grossAnnual) * 100;
    const postDeductionsPct = (postDeductions / grossAnnual) * 100;
    const billsPct = (annualBills / grossAnnual) * 100;
    const remainingPct = Math.max(0, (remaining / grossAnnual) * 100);
    
    // Update chart segment widths
    document.getElementById('chartFederalTaxes').style.width = `${federalPct}%`;
    document.getElementById('chartStateTaxes').style.width = `${statePct}%`;
    document.getElementById('chartPayrollTaxes').style.width = `${payrollPct}%`;
    document.getElementById('chartPreTaxDeductions').style.width = `${preDeductionsPct}%`;
    document.getElementById('chartPostTaxDeductions').style.width = `${postDeductionsPct}%`;
    document.getElementById('chartBills').style.width = `${billsPct}%`;
    document.getElementById('chartTakeHome').style.width = `${remainingPct}%`;
    
    // Update legend with amounts converted to selected period
    document.getElementById('legendFederalTaxes').textContent = convertToPeriod(federalTax, period).toFixed(2);
    document.getElementById('legendStateTaxes').textContent = convertToPeriod(stateTax, period).toFixed(2);
    document.getElementById('legendPayrollTaxes').textContent = convertToPeriod(payrollTax, period).toFixed(2);
    document.getElementById('legendPreTaxDeductions').textContent = convertToPeriod(preDeductions, period).toFixed(2);
    document.getElementById('legendPostTaxDeductions').textContent = convertToPeriod(postDeductions, period).toFixed(2);
    document.getElementById('legendBills').textContent = convertToPeriod(annualBills, period).toFixed(2);
    document.getElementById('legendTakeHome').textContent = convertToPeriod(remaining, period).toFixed(2);
    
    // Update legend labels to show current period
    updateLegendLabels(periodLabel);
    
    // Store data globally for detail charts
    window.chartData = {
        grossAnnual, federalTax, stateTax, payrollTax, 
        preDeductions, postDeductions, annualBills, remaining,
        ...additionalData
    };
    
    // Add click handlers to chart segments
    addChartClickHandlers();
}

function addChartClickHandlers() {
    const bind = (id, section) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.onclick = () => handleChartClick(el, section);
    };
    bind('chartFederalTaxes', 'federal-taxes');
    bind('chartStateTaxes', 'state-taxes');
    bind('chartPayrollTaxes', 'payroll-taxes');
    bind('chartPreTaxDeductions', 'pretax-deductions');
    bind('chartPostTaxDeductions', 'posttax-deductions');
    bind('chartBills', 'bills');
    bind('chartTakeHome', 'take-home');
}

function handleChartClick(element, section) {
    // Clear previous selection
    document.querySelectorAll('#mainChartContainer .chart-segment.selected')
        .forEach(seg => seg.classList.remove('selected'));
    // Mark selected
    element.classList.add('selected');
    // Dim other segments
    const mainContainer = document.getElementById('mainChartContainer');
    if (mainContainer) mainContainer.classList.add('dimmed');
    // Show detail view
    showDetailChart(section);
}

function showDetailChart(section) {
    const data = window.chartData;
    if (!data) return;
    
    const detailContainer = document.getElementById('detailChartContainer');
    const mainContainer = document.getElementById('mainChartContainer');
    const title = document.getElementById('detailChartTitle');
    const chartBar = document.getElementById('detailChart');
    const legend = document.getElementById('detailChartLegend');
    
    // Clear previous detail chart
    chartBar.innerHTML = '';
    legend.innerHTML = '';
    
    let detailData = [];
    let sectionTitle = '';
    
    switch(section) {
        case 'federal-taxes':
            sectionTitle = 'Federal Taxes Breakdown';
            detailData = getFederalTaxBreakdown(data);
            break;
        case 'state-taxes':
            sectionTitle = 'State Taxes Breakdown';
            detailData = getStateTaxBreakdown(data);
            break;
        case 'payroll-taxes':
            sectionTitle = 'Payroll Taxes Breakdown';
            detailData = getPayrollTaxBreakdown(data);
            break;
        case 'pretax-deductions':
            sectionTitle = 'Pre-tax Deductions Breakdown';
            detailData = getPreTaxDeductionsBreakdown(data);
            break;
        case 'posttax-deductions':
            sectionTitle = 'Post-tax Deductions Breakdown';
            detailData = getPostTaxDeductionsBreakdown(data);
            break;
        case 'bills':
            sectionTitle = 'Monthly Bills Breakdown';
            detailData = getBillsBreakdown(data);
            break;
        case 'take-home':
            sectionTitle = 'Remaining Income';
            detailData = getTakeHomeBreakdown(data);
            break;
    }
    
    if (detailData.length === 0) return;
    
    // Store current detail data for period changes
    window.currentDetailData = detailData;
    
    title.textContent = sectionTitle;
    createDetailChart(detailData, chartBar, legend);
    
    // Show detail chart with animation
    mainContainer.classList.add('hidden');
    detailContainer.style.display = 'block';
    setTimeout(() => {
        detailContainer.classList.add('show');
    }, 50);
}

function createDetailChart(data, chartElement, legendElement) {
    // Get current period selection for detail chart
    const period = document.getElementById('detailChartPeriod')?.value || 'monthly';
    
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    
    data.forEach((item, index) => {
        const percentage = total > 0 ? (item.amount / total) * 100 : 0;
        // Note: item.amount is already in monthly format from breakdown functions
        const periodAmount = convertToPeriod(item.amount * 12, period); // Convert to annual first, then to selected period
        
        // Create chart segment
        const segment = document.createElement('div');
        segment.className = `chart-segment detail-segment-${index + 1}`;
        segment.style.width = `${percentage}%`;
        segment.title = `${item.label}: $${periodAmount.toFixed(2)} (${percentage.toFixed(1)}%)`;
        chartElement.appendChild(segment);
        
        // Create legend item
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <div class="legend-color detail-segment-${index + 1}"></div>
            <span class="legend-label">${item.label}:</span>
            <span class="legend-value">$${periodAmount.toFixed(2)}</span>
        `;
        legendElement.appendChild(legendItem);
    });
}

function getFederalTaxBreakdown(data) {
    const filingStatus = document.getElementById('filingStatus').value;
    const taxYear = document.getElementById('taxYear').value;

    // Mirror brackets from calculateBudget
    const taxYearData = {
        2025: {
            single: [11600, 47150, 100525, 191750, 243725, 609350, Infinity],
            married: [23200, 94300, 201050, 383900, 487450, 731200, Infinity],
            rates: [0.10, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37]
        },
        2024: {
            single: [11000, 44725, 95375, 182050, 231250, 578125, Infinity],
            married: [22000, 89450, 190750, 364200, 462500, 693750, Infinity],
            rates: [0.10, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37]
        }
    };

    const yearData = taxYearData[taxYear] || taxYearData['2025'];
    const thresholds = filingStatus === 'married' ? yearData.married : yearData.single;
    const rates = yearData.rates;
    const filingKey = filingStatus === 'married' ? 'married' : 'single';
    const standardDeduction = (yearData.standardDeduction && yearData.standardDeduction[filingKey]) || 0;
    const taxableIncome = Math.max(0, (data.totalGrossAnnual - data.totalPreTaxDeductionsAnnual) - standardDeduction);

    let breakdown = [];
    let remaining = Math.max(0, taxableIncome);
    let prev = 0;
    for (let i = 0; i < thresholds.length; i++) {
        if (remaining <= 0) break;
        const limit = thresholds[i];
        const width = limit === Infinity ? Infinity : limit - prev;
        const taxableAtBracket = Math.min(remaining, width);
        if (taxableAtBracket > 0) {
            const taxAtBracket = taxableAtBracket * rates[i];
            breakdown.push({ label: `${(rates[i] * 100).toFixed(0)}% Tax Bracket`, amount: taxAtBracket / 12 });
            remaining -= taxableAtBracket;
        }
        prev = limit;
    }
    return breakdown;
}

function getStateTaxBreakdown(data) {
    const stateTaxRate = parseFloat(document.getElementById('stateTax').value) || 0;
    if (stateTaxRate === 0) return [];
    
    return [{
        label: `State Tax (${stateTaxRate}%)`,
        amount: data.stateTax / 12
    }];
}

function getPayrollTaxBreakdown(data) {
    const socialSecurityTax = data.socialSecurityTax || 0;
    const medicareTax = data.medicareTax || 0;
    const additionalMedicare = data.additionalMedicareTax || 0;
    const breakdown = [
        { label: 'Social Security (6.2%)', amount: socialSecurityTax / 12 },
        { label: 'Medicare (1.45%)', amount: medicareTax / 12 }
    ];
    if (additionalMedicare > 0) breakdown.push({ label: 'Additional Medicare (0.9%)', amount: additionalMedicare / 12 });
    return breakdown;
}

function getPreTaxDeductionsBreakdown(data) {
    let breakdown = [];
    
    if (data.totalTraditional401kAnnual > 0) {
        breakdown.push({ label: 'Traditional 401(k)', amount: data.totalTraditional401kAnnual / 12 });
    }
    if (data.totalTraditionalIrAAnnual > 0) {
        breakdown.push({ label: 'Traditional IRA', amount: data.totalTraditionalIrAAnnual / 12 });
    }
    if (data.totalHsaAnnual > 0) {
        breakdown.push({ label: 'HSA Contributions', amount: data.totalHsaAnnual / 12 });
    }
    if (data.totalOtherDeductionsAnnual > 0) {
        breakdown.push({ label: 'Other Pre-tax', amount: data.totalOtherDeductionsAnnual / 12 });
    }
    
    return breakdown;
}

function getPostTaxDeductionsBreakdown(data) {
    let breakdown = [];
    
    if (data.totalRoth401kAnnual > 0) {
        breakdown.push({ label: 'Roth 401(k)', amount: data.totalRoth401kAnnual / 12 });
    }
    if (data.totalRothIrAAnnual > 0) {
        breakdown.push({ label: 'Roth IRA', amount: data.totalRothIrAAnnual / 12 });
    }
    
    return breakdown;
}

function getBillsBreakdown(data) {
    let breakdown = [];
    
    // Group bills by category
    const needBills = bills.filter(bill => bill.category === 'need');
    const wantBills = bills.filter(bill => bill.category === 'want');
    
    // Add individual bills
    needBills.forEach(bill => {
        breakdown.push({ label: `${bill.name} (Need)`, amount: bill.amount });
    });
    
    wantBills.forEach(bill => {
        breakdown.push({ label: `${bill.name} (Want)`, amount: bill.amount });
    });
    
    return breakdown;
}

function getTakeHomeBreakdown(data) {
    return [{
        label: 'Available for Savings & Discretionary Spending',
        amount: data.remaining / 12
    }];
}

function hideDetailChart() {
    const detailContainer = document.getElementById('detailChartContainer');
    const mainContainer = document.getElementById('mainChartContainer');
    
    detailContainer.classList.remove('show');
    setTimeout(() => {
        detailContainer.style.display = 'none';
        mainContainer.classList.remove('hidden');
        mainContainer.classList.remove('dimmed');
        // Clear selected highlight when returning
        document.querySelectorAll('#mainChartContainer .chart-segment.selected')
            .forEach(seg => seg.classList.remove('selected'));
    }, 400);
}

// Add event listener for back button and period toggles
document.addEventListener('DOMContentLoaded', function() {
    const backButton = document.getElementById('backToMainChart');
    if (backButton) {
        backButton.addEventListener('click', hideDetailChart);
    }
    
    // Add period change listeners using event delegation
    document.addEventListener('change', function(e) {
        if (e.target.id === 'chartPeriod') {
            handleMainPeriodChange.call(e.target);
        } else if (e.target.id === 'detailChartPeriod') {
            handleDetailPeriodChange.call(e.target);
        }
    });
});

// Flag to prevent recursive period changes
let updatingPeriod = false;

function handleMainPeriodChange() {
    if (updatingPeriod) return;
    updatingPeriod = true;

    const newPeriod = this.value;
    const detailPeriodSelector = document.getElementById('detailChartPeriod');

    // Sync detail chart period
    if (detailPeriodSelector) {
        detailPeriodSelector.value = newPeriod;
    }

    // Update main chart
    calculateBudget();

    // Update detail chart if visible
    const currentData = window.currentDetailData;
    const detailContainer = document.getElementById('detailChartContainer');
    if (currentData && detailContainer.style.display === 'block') {
        const chartBar = document.getElementById('detailChart');
        const legend = document.getElementById('detailChartLegend');
        chartBar.innerHTML = '';
        legend.innerHTML = '';
        createDetailChart(currentData, chartBar, legend);
    }

    setTimeout(() => {
        updatingPeriod = false;
    }, 100);
}

function handleDetailPeriodChange() {
    if (updatingPeriod) return;
    updatingPeriod = true;

    const newPeriod = this.value;
    const mainPeriodSelector = document.getElementById('chartPeriod');

    // Sync main chart period
    if (mainPeriodSelector) {
        mainPeriodSelector.value = newPeriod;
    }

    // Update main chart
    calculateBudget();

    // Update detail chart
    const currentData = window.currentDetailData;
    if (currentData) {
        const chartBar = document.getElementById('detailChart');
        const legend = document.getElementById('detailChartLegend');
        chartBar.innerHTML = '';
        legend.innerHTML = '';
        createDetailChart(currentData, chartBar, legend);
    }

    setTimeout(() => {
        updatingPeriod = false;
    }, 100);
}

// Function to update Social Security and Medicare rates based on self-employment status
function updateSelfEmploymentRates(person) {
    const isSelfEmployed = document.getElementById(`selfEmployed${person}`).checked;
    const socialSecurityRateInput = document.getElementById(`socialSecurityRate${person}`);
    const medicareRateInput = document.getElementById(`medicareRate${person}`);

    // Normalize to base employee rates if values match the opposite state
    const baseSS = 6.2, baseMed = 1.45;
    const seSS = 12.4, seMed = 2.9;

    if (isSelfEmployed) {
        if (parseFloat(socialSecurityRateInput.value) === baseSS) socialSecurityRateInput.value = String(seSS);
        if (parseFloat(medicareRateInput.value) === baseMed) medicareRateInput.value = String(seMed);
    } else {
        if (parseFloat(socialSecurityRateInput.value) === seSS) socialSecurityRateInput.value = String(baseSS);
        if (parseFloat(medicareRateInput.value) === seMed) medicareRateInput.value = String(baseMed);
    }

    // Recalculate after toggling
    calculateBudget();
}

// Add event listeners for self-employment toggles
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('selfEmployed1').addEventListener('change', function() {
        updateSelfEmploymentRates('1');
        calculateBudget(); // Auto-calculate when self-employment status changes
    });
    
    document.getElementById('selfEmployed2').addEventListener('change', function() {
        updateSelfEmploymentRates('2');
        calculateBudget(); // Auto-calculate when self-employment status changes
    });
    
    // Add event listeners for all inputs to trigger auto-calculation
    setupAutoCalculation();
    
    // Set initial calculation box width
    const peopleCountRadio = document.querySelector('input[name="peopleCount"]:checked');
    const twoPeople = peopleCountRadio && peopleCountRadio.value === 'two';
    // Seed mode classes on the results box
    const budgetResult = document.getElementById('budgetResult');
    if (budgetResult) {
        budgetResult.classList.toggle('two-people', twoPeople);
        budgetResult.classList.toggle('one-person', !twoPeople);
    }
    updateCalculationBoxWidth(twoPeople);
    
    // Setup scroll-based expansion
    setupScrollExpansion();
    
    // Perform initial calculation after page loads
    setTimeout(calculateBudget, 100); // Small delay to ensure all elements are ready

    // Optional: run built-in tests via URL hash "#budget-tests"
    try {
        if (location && location.hash === '#budget-tests') {
            runBudgetSelfTests();
        }
    } catch (_) { /* ignore */ }
});

// Function to setup scroll-based expansion of calculation box
function setupScrollExpansion() {
    let ticking = false;
    
    function updateCalculationBoxExpansion() {
        const budgetResult = document.getElementById('budgetResult');
        const budgetContainer = document.getElementById('budgetTrackerContainer');
        
        if (!budgetResult || !budgetContainer || budgetContainer.style.display === 'none') {
            return;
        }
        
        // Calculate scroll progress
        const doc = document.documentElement;
        const windowHeight = window.innerHeight;
        const documentHeight = doc.scrollHeight;
        const scrollTop = window.pageYOffset;
        const scrollProgress = Math.min(1, Math.max(0, (scrollTop + windowHeight - documentHeight + 300) / 300));
        
        // Get bills container width for consistent sizing
        const billsContainer = document.querySelector('.input-group.full-width:last-of-type');
        const billsContainerWidth = billsContainer ? billsContainer.getBoundingClientRect().width : 600;
        
        // Add buffer below bills when expanded - dynamically match calculation box height
        if (billsContainer) {
            const scrollProgress = Math.min(1, Math.max(0, (scrollTop + windowHeight - documentHeight + 300) / 300));
            if (scrollProgress > 0.1) {
                // Get the actual height of the calculation box
                const calculationBoxHeight = budgetResult.getBoundingClientRect().height;
                // Add some extra padding (20px) for visual breathing room
                const dynamicMargin = calculationBoxHeight + 20;
                billsContainer.style.marginBottom = `${dynamicMargin}px`;
            } else {
                billsContainer.style.marginBottom = ''; // Remove buffer when not expanded
            }
        }
        
        // Set consistent base width to match bills container
        const baseWidth = `${billsContainerWidth}px`;
        const baseMaxWidth = '95vw';
        
        // Target width also matches bills container
        const targetWidth = `${billsContainerWidth}px`;
        const targetMaxWidth = '95vw';
        
        // Apply smooth transition based on scroll progress
        if (scrollProgress > 0) {
            // Gradually expand as we approach bottom
            const easedProgress = scrollProgress * scrollProgress; // Ease-in effect
            
            if (easedProgress < 0.1) {
                budgetResult.style.width = baseWidth;
                budgetResult.style.maxWidth = baseMaxWidth;
                budgetResult.classList.remove('expanded');
            } else {
                budgetResult.style.width = targetWidth;
                budgetResult.style.maxWidth = targetMaxWidth;
                budgetResult.classList.add('expanded');
            }
            
            // Set transition for smooth animation
            budgetResult.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        } else {
            // Not near bottom, use base size
            budgetResult.style.width = baseWidth;
            budgetResult.style.maxWidth = baseMaxWidth;
            budgetResult.classList.remove('expanded');
            budgetResult.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        }
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateCalculationBoxExpansion);
            ticking = true;
        }
    }
    
    // Add scroll listener
    window.addEventListener('scroll', requestTick);
    
    // Add resize listener to recalculate on window resize
    window.addEventListener('resize', requestTick);

    // Run once on setup to set initial state based on current scroll
    requestTick();
}

// Function to set up auto-calculation for all form inputs
function setupAutoCalculation() {
    // Get all input elements that should trigger recalculation
    const inputs = document.querySelectorAll(
        'input[type="number"], input[type="checkbox"], select, input[type="radio"]'
    );
    
    inputs.forEach(input => {
        // Skip bill and deduction input fields (they have their own handlers)
        if (input.id.includes('billName') || input.id.includes('billAmount') || 
            input.id.includes('deductionName') || input.id.includes('deductionAmount') ||
            input.id.includes('deductionType') || input.id === 'chartPeriod' || 
            input.id === 'detailChartPeriod') {
            return;
        }
        
        if (input.type === 'number') {
            input.addEventListener('input', calculateBudget);
            input.addEventListener('change', calculateBudget);
        } else if (input.type === 'checkbox' || input.type === 'radio') {
            input.addEventListener('change', calculateBudget);
        } else if (input.tagName === 'SELECT') {
            input.addEventListener('change', calculateBudget);
        }
    });
}

// --- Self-test harness (invoked only manually via URL hash) ---
function runBudgetSelfTests() {
    const report = [];
    function set(id, val) { const el = document.getElementById(id); if (el) el.value = val; }
    function setC(id, val) { const el = document.getElementById(id); if (el) el.checked = val; }
    function sel(id, val) { const el = document.getElementById(id); if (el) el.value = val; }

    // Save original localStorage to avoid clobbering user data
    const backup = localStorage.getItem('budgetTrackerInputs');
    const backupToggle = localStorage.getItem('budgetSaveInputs');
    localStorage.setItem('budgetSaveInputs', 'false');

    const cases = [
        { name: 'Zero income', f: () => {
            set('salary1', '0'); setC('selfEmployed1', false); sel('payFrequency1', 'monthly');
            set('salary2', '0'); setC('selfEmployed2', false); sel('payFrequency2', 'monthly');
            document.querySelector('input[name="peopleCount"][value="one"]').checked = true; togglePeopleCount('one');
            bills = []; deductions1 = []; deductions2 = []; updateBillsList(); updateDeductionsList(1); updateDeductionsList(2);
        }},
        { name: 'Single high salary, weekly', f: () => {
            set('salary1', '200000'); setC('selfEmployed1', false); sel('payFrequency1', 'weekly');
            document.querySelector('input[name="peopleCount"][value="one"]').checked = true; togglePeopleCount('one');
            set('stateTax', '5');
        }},
        { name: 'Two people mixed employment, bi-weekly', f: () => {
            set('salary1', '90000'); setC('selfEmployed1', true); sel('payFrequency1', 'bi-weekly');
            set('salary2', '60000'); setC('selfEmployed2', false); sel('payFrequency2', 'bi-weekly');
            document.querySelector('input[name="peopleCount"][value="two"]').checked = true; togglePeopleCount('two');
            set('stateTax', '3');
        }},
        { name: 'Max deductions + bills', f: () => {
            set('salary1', '120000'); setC('selfEmployed1', false); sel('payFrequency1', 'monthly');
            document.getElementById('retirementToggle1').checked = true; toggleInput('retirementToggle1', 'retirementGroup1');
            document.querySelector('input[name="retirementType1"][value="percentage"]').checked = true; updateRetirementType('1', 'percentage');
            set('retirement1', '10');
            document.getElementById('iraToggle1').checked = true; toggleInput('iraToggle1', 'iraGroup1'); set('ira1', '7000');
            document.getElementById('hsaToggle1').checked = true; toggleInput('hsaToggle1', 'hsaGroup1'); set('hsa1', '4300');
            document.getElementById('otherDeductionsToggle1').checked = true; toggleInput('otherDeductionsToggle1', 'otherDeductionsGroup1');
            deductions1 = [ {name:'Medical', amount:150, type:'pre-tax'}, {name:'Parking', amount:50, type:'post-tax'} ]; updateDeductionsList(1);
            bills = [ {name:'Rent', amount:1800, category:'need'}, {name:'Groceries', amount:600, category:'need'}, {name:'Streaming', amount:30, category:'want'} ]; updateBillsList();
        }},
    ];

    cases.forEach(tc => {
        try {
            tc.f();
            calculateBudget();
            // Basic invariants
            const gross = parseFloat(document.getElementById('grossPayYearly').textContent.replace(/[$,]/g,'')) || 0;
            const taxes = parseFloat(document.getElementById('taxesYearly').textContent.replace(/[$,]/g,'')) || 0;
            const pre = parseFloat(document.getElementById('deductionsYearly').textContent.replace(/[$,]/g,'')) || 0;
            const net = parseFloat(document.getElementById('takeHomeYearly').textContent.replace(/[$,]/g,'')) || 0;
            if (gross < 0 || taxes < 0 || pre < 0 || net < 0) throw new Error('Negative amounts');
            if (isNaN(gross) || isNaN(taxes) || isNaN(pre) || isNaN(net)) throw new Error('NaN values');
            report.push(`PASS: ${tc.name}`);
        } catch (e) {
            report.push(`FAIL: ${tc.name} -> ${e.message}`);
        }
    });

    // Restore localStorage state
    if (backupToggle === null) localStorage.removeItem('budgetSaveInputs'); else localStorage.setItem('budgetSaveInputs', backupToggle);
    if (backup === null) localStorage.removeItem('budgetTrackerInputs'); else localStorage.setItem('budgetTrackerInputs', backup);

    console.log('[Budget Self Tests]', report);
}
